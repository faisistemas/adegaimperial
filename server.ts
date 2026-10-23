import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getSupabaseServerClient, getSupabaseConfigStatus } from './server/supabase';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser
  app.use(express.json({ limit: '10mb' }));

  // ========================================================
  // API Routes: Supabase Status & Backend Persistence
  // ========================================================

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Supabase Configuration Status
  app.get('/api/supabase/status', async (_req: Request, res: Response) => {
    const status = getSupabaseConfigStatus();
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return res.json({
        ...status,
        connected: false,
        message: 'Variáveis de ambiente do Supabase (SUPABASE_URL e SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY) não detectadas.',
      });
    }

    try {
      // Test basic connection
      const { error } = await supabase.from('produtos').select('count', { count: 'exact', head: true });
      if (error) {
        // Table might not exist yet, but connection was made to the project
        return res.json({
          ...status,
          connected: true,
          schemaReady: false,
          message: `Conectado ao Supabase! Porém tabela 'produtos' retornou: ${error.message}. Execute o script SQL para criar as tabelas.`,
        });
      }

      return res.json({
        ...status,
        connected: true,
        schemaReady: true,
        message: 'Conectado com sucesso ao banco de dados Supabase.',
      });
    } catch (err: any) {
      return res.json({
        ...status,
        connected: false,
        message: `Falha ao consultar Supabase: ${err.message || String(err)}`,
      });
    }
  });

  // Proxy: Buscar Produtos do Supabase (com fallback)
  app.get('/api/products', async (_req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return res.status(200).json({ source: 'local', products: [] });
    }

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return res.status(200).json({ source: 'local', error: error.message, products: [] });
      }

      return res.json({ source: 'supabase', products: data || [] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Proxy: Salvar / Atualizar Produto no Supabase
  app.post('/api/products', async (req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return res.status(200).json({ savedLocal: true, message: 'Operando localmente. Configure Supabase para persistir em nuvem.' });
    }

    try {
      const product = req.body;
      const { data, error } = await supabase
        .from('produtos')
        .upsert({
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          category: product.category,
          price: product.price,
          cost_price: product.costPrice,
          stock_units: product.stockUnits,
          image: product.image,
          is_fractionable: product.isFractionable ?? false,
          bottle_volume_ml: product.bottleVolumeMl,
          dose_volume_ml: product.doseVolumeMl,
          price_per_dose: product.pricePerDose,
          open_bottle_volume_ml: product.openBottleVolumeMl,
          is_weighed: product.isWeighed ?? false,
          price_per_kg: product.pricePerKg,
          min_stock_alert: product.minStockAlert ?? 5,
          ncm: product.ncm || '2208.90.00',
          cfop: product.cfop || '5.405',
          cst_icms: product.cstIcms || '500',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, product: data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Proxy: Buscar Pedidos / Vendas do Supabase
  app.get('/api/orders', async (_req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return res.status(200).json({ source: 'local', orders: [] });
    }

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(200).json({ source: 'local', error: error.message, orders: [] });
      }

      return res.json({ source: 'supabase', orders: data || [] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Proxy: Salvar Nova Venda / Pedido no Supabase
  app.post('/api/orders', async (req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return res.status(200).json({ savedLocal: true, message: 'Gravado no armazenamento local.' });
    }

    try {
      const order = req.body;
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
          id: order.id,
          code: order.code,
          store_id: order.storeId,
          created_at: new Date().toISOString(),
          subtotal: order.subtotal,
          discount: order.discount || 0,
          service_fee: order.serviceFee || 0,
          delivery_fee: order.deliveryFee || 0,
          total: order.total,
          status: order.status || 'COMPLETED',
          order_type: order.orderType || 'PDV_BALCAO',
          table_number: order.tableNumber,
          comanda_number: order.comandaNumber,
          customer_name: order.customerName,
          customer_cpf: order.customerCpf,
          operator_name: order.operatorName,
          nfce_key: order.nfceKey,
          nfce_protocol: order.nfceProtocol,
          payment_method: order.payment?.method,
          payment_details: order.payment,
          items: order.items,
        })
        .select()
        .single();

      if (error) {
        console.error('[Supabase Order Error]', error);
        return res.status(400).json({ error: error.message });
      }

      return res.json({ success: true, order: data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Sincronização em Lote (Batch Sync)
  app.post('/api/sync', async (req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return res.json({
        synced: false,
        message: 'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY.',
      });
    }

    try {
      const { products, orders } = req.body;
      let productsCount = 0;
      let ordersCount = 0;

      if (Array.isArray(products) && products.length > 0) {
        const formatted = products.map((p) => ({
          id: p.id,
          name: p.name,
          barcode: p.barcode,
          category: p.category,
          price: p.price,
          cost_price: p.costPrice,
          stock_units: p.stockUnits,
          image: p.image,
          is_fractionable: p.isFractionable ?? false,
          bottle_volume_ml: p.bottleVolumeMl,
          dose_volume_ml: p.doseVolumeMl,
          price_per_dose: p.pricePerDose,
          open_bottle_volume_ml: p.openBottleVolumeMl,
          is_weighed: p.isWeighed ?? false,
          price_per_kg: p.pricePerKg,
          min_stock_alert: p.minStockAlert ?? 5,
          ncm: p.ncm || '2208.90.00',
          cfop: p.cfop || '5.405',
          cst_icms: p.cstIcms || '500',
          updated_at: new Date().toISOString(),
        }));

        const { error: prodErr } = await supabase.from('produtos').upsert(formatted);
        if (!prodErr) productsCount = formatted.length;
      }

      if (Array.isArray(orders) && orders.length > 0) {
        const formattedOrders = orders.map((o) => ({
          id: o.id,
          code: o.code,
          store_id: o.storeId,
          subtotal: o.subtotal,
          discount: o.discount || 0,
          service_fee: o.serviceFee || 0,
          delivery_fee: o.deliveryFee || 0,
          total: o.total,
          status: o.status || 'COMPLETED',
          order_type: o.orderType || 'PDV_BALCAO',
          table_number: o.tableNumber,
          comanda_number: o.comandaNumber,
          customer_name: o.customerName,
          customer_cpf: o.customerCpf,
          operator_name: o.operatorName,
          nfce_key: o.nfceKey,
          nfce_protocol: o.nfceProtocol,
          payment_method: o.payment?.method,
          payment_details: o.payment,
          items: o.items,
        }));

        const { error: ordErr } = await supabase.from('pedidos').upsert(formattedOrders);
        if (!ordErr) ordersCount = formattedOrders.length;
      }

      return res.json({
        synced: true,
        productsCount,
        ordersCount,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ========================================================
  // Vite Integration & Static Serving
  // ========================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express Backend] Rodando na porta ${PORT} com suporte ao Supabase.`);
  });
}

startServer();
