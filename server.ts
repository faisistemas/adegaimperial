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

  // Teste de tabelas no Supabase
  app.get('/api/test-tables', async (_req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return res.json({ error: 'No supabase client' });

    const [produtos, pedidos, sessoes, mesas, comandas, clientes] = await Promise.all([
      supabase.from('produtos').select('count', { count: 'exact', head: true }),
      supabase.from('pedidos').select('count', { count: 'exact', head: true }),
      supabase.from('caixa_sessoes').select('count', { count: 'exact', head: true }),
      supabase.from('mesas').select('count', { count: 'exact', head: true }),
      supabase.from('comandas').select('count', { count: 'exact', head: true }),
      supabase.from('clientes').select('count', { count: 'exact', head: true })
    ]);

    return res.json({
      produtos: { error: produtos.error?.message, count: produtos.count },
      pedidos: { error: pedidos.error?.message, count: pedidos.count },
      sessoes: { error: sessoes.error?.message, count: sessoes.count },
      mesas: { error: mesas.error?.message, count: mesas.count },
      comandas: { error: comandas.error?.message, count: comandas.count },
      clientes: { error: clientes.error?.message, count: clientes.count },
    });
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

  // ========================================================
  // Proxy: Usuários do Sistema (Supabase)
  // ========================================================
  app.get('/api/users', async (_req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return res.status(200).json({ source: 'local', users: [] });

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return res.status(200).json({ source: 'local', error: error.message, users: [] });
      }

      const formatted = (data || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar || '/logo.jpg',
        pin: u.pin,
        storeId: u.store_id || 'store-1',
        phone: u.phone,
        whatsapp: u.whatsapp,
        cpfCnpj: u.cpf_cnpj,
      }));

      return res.json({ source: 'supabase', users: formatted });
    } catch (err: any) {
      return res.status(200).json({ source: 'local', error: err.message, users: [] });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    const user = req.body;
    if (!user || !user.name) {
      return res.status(400).json({ error: 'Dados do usuário inválidos.' });
    }

    if (!supabase) {
      return res.status(200).json({ savedLocal: true, message: 'Operando localmente.' });
    }

    try {
      const dbUser = {
        id: user.id || `u-${Date.now()}`,
        name: user.name,
        email: user.email || '',
        role: user.role || 'WAITER',
        avatar: user.avatar || '/logo.jpg',
        pin: String(user.pin || ''),
        store_id: user.storeId || 'store-1',
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('usuarios')
        .upsert(dbUser)
        .select()
        .single();

      if (error) {
        console.warn('[Supabase Users Upsert Warning]:', error.message);
        return res.status(200).json({ savedLocal: true, error: error.message });
      }

      return res.json({ success: true, user: data });
    } catch (err: any) {
      return res.status(200).json({ savedLocal: true, error: err.message });
    }
  });

  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    const { id } = req.params;

    if (!supabase) return res.status(200).json({ savedLocal: true });

    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) {
        return res.status(200).json({ savedLocal: true, error: error.message });
      }
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(200).json({ savedLocal: true, error: err.message });
    }
  });

  // ========================================================
  // Proxy: Clientes (Supabase)
  // ========================================================
  app.get('/api/customers', async (_req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return res.status(200).json({ source: 'local', customers: [] });

    try {
      const { data, error } = await supabase.from('clientes').select('*').order('name', { ascending: true });
      if (error) return res.status(200).json({ source: 'local', error: error.message, customers: [] });

      const formatted = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        cpfCnpj: c.cpf_cnpj,
        phone: c.phone,
        email: c.email,
        address: c.address,
        totalSpent: Number(c.total_spent || 0),
        ordersCount: Number(c.orders_count || 0),
        creditBalance: Number(c.credit_balance || 0),
        loyaltyPoints: Number(c.loyalty_points || 0),
      }));

      return res.json({ source: 'supabase', customers: formatted });
    } catch (err: any) {
      return res.status(200).json({ source: 'local', error: err.message, customers: [] });
    }
  });

  app.post('/api/customers', async (req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    const customer = req.body;
    if (!customer || !customer.name) return res.status(400).json({ error: 'Dados do cliente inválidos.' });
    if (!supabase) return res.status(200).json({ savedLocal: true });

    try {
      const dbCustomer = {
        id: customer.id || `cust-${Date.now()}`,
        name: customer.name,
        cpf_cnpj: customer.cpfCnpj || null,
        phone: customer.phone || null,
        email: customer.email || null,
        address: customer.address || null,
        total_spent: customer.totalSpent || 0,
        orders_count: customer.ordersCount || 0,
        credit_balance: customer.creditBalance || 0,
        loyalty_points: customer.loyaltyPoints || 0,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('clientes').upsert(dbCustomer).select().single();
      if (error) return res.status(200).json({ savedLocal: true, error: error.message });

      return res.json({ success: true, customer: data });
    } catch (err: any) {
      return res.status(200).json({ savedLocal: true, error: err.message });
    }
  });

  // ========================================================
  // Sincronização em Lote de Todo o Sistema (Supabase)
  // ========================================================
  app.post('/api/sync', async (req: Request, res: Response) => {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return res.json({
        synced: false,
        message: 'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY / SERVICE_ROLE_KEY.',
      });
    }

    try {
      const { products, orders, users, customers, tables, comandas } = req.body;
      let productsCount = 0;
      let ordersCount = 0;
      let usersCount = 0;
      let customersCount = 0;

      // 1. Produtos
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

      // 2. Pedidos
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

      // 3. Usuários
      if (Array.isArray(users) && users.length > 0) {
        const formattedUsers = users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email || '',
          role: u.role || 'WAITER',
          avatar: u.avatar || '/logo.jpg',
          pin: String(u.pin || ''),
          store_id: u.storeId || 'store-1',
          phone: u.phone || null,
          whatsapp: u.whatsapp || null,
          cpf_cnpj: u.cpfCnpj || null,
          updated_at: new Date().toISOString(),
        }));

        const { error: userErr } = await supabase.from('usuarios').upsert(formattedUsers);
        if (!userErr) usersCount = formattedUsers.length;
      }

      // 4. Clientes
      if (Array.isArray(customers) && customers.length > 0) {
        const formattedCustomers = customers.map((c) => ({
          id: c.id,
          name: c.name,
          cpf_cnpj: c.cpfCnpj || null,
          phone: c.phone || null,
          email: c.email || null,
          address: c.address || null,
          total_spent: c.totalSpent || 0,
          orders_count: c.ordersCount || 0,
          credit_balance: c.creditBalance || 0,
          loyalty_points: c.loyaltyPoints || 0,
          updated_at: new Date().toISOString(),
        }));

        const { error: custErr } = await supabase.from('clientes').upsert(formattedCustomers);
        if (!custErr) customersCount = formattedCustomers.length;
      }

      // 5. Mesas
      if (Array.isArray(tables) && tables.length > 0) {
        const formattedTables = tables.map((t) => ({
          id: t.id,
          number: t.number,
          name: t.name,
          status: t.status,
          guests_count: t.guestsCount || 0,
          total_amount: t.totalAmount || 0,
          waiter_name: t.waiterName || null,
          items: t.items || [],
          updated_at: new Date().toISOString(),
        }));
        await supabase.from('mesas').upsert(formattedTables);
      }

      // 6. Comandas
      if (Array.isArray(comandas) && comandas.length > 0) {
        const formattedComandas = comandas.map((c) => ({
          id: c.id,
          number: c.number,
          customer_name: c.customerName,
          customer_cpf: c.customerCpf || null,
          status: c.status,
          total_amount: c.totalAmount || 0,
          opened_at: c.openedAt || new Date().toISOString(),
          closed_at: c.closedAt || null,
          items: c.items || [],
        }));
        await supabase.from('comandas').upsert(formattedComandas);
      }

      return res.json({
        synced: true,
        productsCount,
        ordersCount,
        usersCount,
        customersCount,
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
