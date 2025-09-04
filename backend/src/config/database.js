const supabase = require('./supabase');

class Database {
  async query(sql, params = []) {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: sql,
        params: params
      });
      
      if (error) {
        console.error('Database query error:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Database connection error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  async select(table, options = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      // Apply filters
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        });
      }
      
      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending !== false 
        });
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Apply offset
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 1000) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Database select error:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Database select failed:', error);
      throw new Error(`Database select failed: ${error.message}`);
    }
  }

  async insert(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(Array.isArray(data) ? data : [data])
        .select();
      
      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      
      return Array.isArray(data) ? result : result[0];
    } catch (error) {
      console.error('Database insert failed:', error);
      throw new Error(`Database insert failed: ${error.message}`);
    }
  }

  async update(table, data, where) {
    try {
      let query = supabase.from(table).update(data);
      
      // Apply where conditions
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data: result, error } = await query.select();
      
      if (error) {
        console.error('Database update error:', error);
        throw error;
      }
      
      return result;
    } catch (error) {
      console.error('Database update failed:', error);
      throw new Error(`Database update failed: ${error.message}`);
    }
  }

  async delete(table, where) {
    try {
      let query = supabase.from(table).delete();
      
      // Apply where conditions
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Database delete error:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Database delete failed:', error);
      throw new Error(`Database delete failed: ${error.message}`);
    }
  }

  // Raw SQL query method for complex queries
  async raw(sql, params = []) {
    return this.query(sql, params);
  }
}

module.exports = new Database();