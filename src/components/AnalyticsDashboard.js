// src/components/AnalyticsDashboard.js - VERSIÓN MEJORADA
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './AnalyticsDashboard.css';

// Nota: esta app no tiene backend, por lo que este login es solo una cortina
// de vista local (evita que alguien mirando por encima del hombro abra el
// dashboard por accidente) y NO debe tratarse como una barrera de seguridad real.
const ADMIN_USERNAME = process.env.REACT_APP_ANALYTICS_USER || 'toons-admin';
const ADMIN_PASSWORD = process.env.REACT_APP_ANALYTICS_PASS || 'satelite-2026';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      onLogin(true);
      setError('');
      sessionStorage.setItem('analyticsAuth', 'true');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🔐 Dashboard de Métricas</h2>
        <div className="input-group">
          <label>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
          />
        </div>
        <div className="input-group">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Ingresa tu contraseña"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button onClick={handleLogin} className="login-button">
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('analyticsAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    try {
      const dataStr = localStorage.getItem('pokedexAnalytics');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        setAnalyticsData(data);
      } else {
        setAnalyticsData({
          totalVisits: 0,
          uniqueUsers: [],
          pokemonViews: [],
          generationStats: [],
          typeStats: [],
          dailyVisits: [],
          totalBattles: 0,
          avgSessionTime: 0,
          events: [],
          deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
          browserStats: {},
          hourlyActivity: Array(24).fill(0),
          weeklyActivity: Array(7).fill(0),
          searchTerms: [],
          topMoves: [],
          pokemonWinRate: [],
          trendingPokemon: [],
          returningUsers: []
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalyticsData({});
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('analyticsAuth');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={setIsAuthenticated} />;
  }

  if (loading) {
    return <div className="loading">Cargando métricas...</div>;
  }

  // Procesar datos
  const uniqueUsersCount = Array.isArray(analyticsData.uniqueUsers) ? analyticsData.uniqueUsers.length : 0;
  const returningUsersCount = Array.isArray(analyticsData.returningUsers) ? analyticsData.returningUsers.length : 0;
  const newUsersCount = uniqueUsersCount - returningUsersCount;

  // KPIs principales
  const kpis = [
    { label: 'Visitas Totales', value: analyticsData.totalVisits || 0, icon: '👥', color: '#667eea' },
    { label: 'Usuarios Únicos', value: uniqueUsersCount, icon: '🎯', color: '#764ba2' },
    { label: 'Batallas Jugadas', value: analyticsData.totalBattles || 0, icon: '⚔️', color: '#f093fb' },
    { label: 'Promedio Sesión', value: `${Math.floor((analyticsData.avgSessionTime || 0) / 60)}:${String((analyticsData.avgSessionTime || 0) % 60).padStart(2, '0')}`, icon: '⏱️', color: '#4facfe' }
  ];

  // Datos para gráficos
  const dailyVisits = analyticsData.dailyVisits || [];
  const topPokemon = (analyticsData.pokemonViews || [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  const generationStats = analyticsData.generationStats || [];
  const typeStats = (analyticsData.typeStats || [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Trending Pokémon (últimas 24h)
  const trendingPokemon = (() => {
    const trending = analyticsData.trendingPokemon || [];
    const counts = {};
    trending.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  // Datos de dispositivos
  const deviceData = analyticsData.deviceStats 
    ? Object.entries(analyticsData.deviceStats).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
      }))
    : [];

  // Datos de navegadores
  const browserData = analyticsData.browserStats
    ? Object.entries(analyticsData.browserStats).map(([name, value]) => ({ name, value }))
    : [];

  // Actividad por hora
  const hourlyData = (analyticsData.hourlyActivity || []).map((count, hour) => ({
    hour: `${hour}:00`,
    visitas: count
  }));

  // Actividad por día de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const weeklyData = (analyticsData.weeklyActivity || []).map((count, day) => ({
    day: weekDays[day],
    visitas: count
  }));

  // Top búsquedas
  const topSearches = (analyticsData.searchTerms || [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top movimientos en batalla
  const topMoves = (analyticsData.topMoves || [])
    .sort((a, b) => b.timesUsed - a.timesUsed)
    .slice(0, 8);

  // Pokémon con mejor win rate
  const topWinners = (analyticsData.pokemonWinRate || [])
    .map(p => ({
      name: p.name,
      wins: p.wins || 0,
      losses: p.losses || 0,
      winRate: p.wins / ((p.wins || 0) + (p.losses || 0)) * 100 || 0
    }))
    .filter(p => (p.wins + p.losses) >= 3)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);

  const recentEvents = (analyticsData.events || []).slice(-15).reverse();

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>📊 Pokédex Toons - Analytics Pro</h1>
          <p>Dashboard avanzado de métricas y estadísticas</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>

      {/* Tabs de navegación */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          📈 General
        </button>
        <button 
          className={`tab-button ${selectedTab === 'pokemon' ? 'active' : ''}`}
          onClick={() => setSelectedTab('pokemon')}
        >
          🎮 Pokémon
        </button>
        <button 
          className={`tab-button ${selectedTab === 'battles' ? 'active' : ''}`}
          onClick={() => setSelectedTab('battles')}
        >
          ⚔️ Batallas
        </button>
        <button 
          className={`tab-button ${selectedTab === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedTab('users')}
        >
          👥 Usuarios
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="kpi-card">
            <div className="kpi-icon" style={{ background: `${kpi.color}20` }}>
              {kpi.icon}
            </div>
            <div>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TAB: GENERAL */}
      {selectedTab === 'overview' && (
        <div className="tab-content">
          <div className="charts-grid">
            {/* Visitas por día */}
            <div className="chart-card chart-large">
              <h3>📈 Tendencia de Visitas</h3>
              {dailyVisits.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyVisits}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="visits" stroke="#667eea" fillOpacity={1} fill="url(#colorVisits)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay datos aún</div>
              )}
            </div>

            {/* Actividad por hora */}
            <div className="chart-card chart-large">
              <h3>🕐 Actividad por Hora del Día</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitas" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Actividad por día de semana */}
            <div className="chart-card">
              <h3>📅 Actividad por Día de la Semana</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visitas" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Dispositivos */}
            <div className="chart-card">
              <h3>📱 Dispositivos</h3>
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay datos aún</div>
              )}
            </div>

            {/* Navegadores */}
            <div className="chart-card">
              <h3>🌐 Navegadores</h3>
              {browserData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={browserData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#F093FB" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay datos aún</div>
              )}
            </div>

            {/* Top búsquedas */}
            <div className="chart-card">
              <h3>🔍 Términos Más Buscados</h3>
              {topSearches.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topSearches} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="term" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#45B7D1" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay búsquedas aún</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: POKÉMON */}
      {selectedTab === 'pokemon' && (
        <div className="tab-content">
          <div className="charts-grid">
            {/* Top Pokémon */}
            <div className="chart-card chart-large">
              <h3>⭐ Top 10 Pokémon Más Vistos</h3>
              {topPokemon.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topPokemon}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#764ba2" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay datos aún</div>
              )}
            </div>

            {/* Trending Pokémon */}
            <div className="chart-card">
              <h3>🔥 Trending (Últimas 24h)</h3>
              {trendingPokemon.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendingPokemon}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF6B6B" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay datos de trending</div>
              )}
            </div>

            {/* Distribución por Generación */}
            <div className="chart-card">
              <h3>🎮 Distribución por Generación</h3>
              {generationStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={generationStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {generationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay datos aún</div>
              )}
            </div>

            {/* Tipos Más Populares */}
            <div className="chart-card">
              <h3>🔥 Tipos Más Populares</h3>
              {typeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4ECDC4" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay datos aún</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: BATALLAS */}
      {selectedTab === 'battles' && (
        <div className="tab-content">
          <div className="charts-grid">
            {/* Top Movimientos */}
            <div className="chart-card chart-large">
              <h3>💪 Movimientos Más Usados</h3>
              {topMoves.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topMoves}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="timesUsed" fill="#F093FB" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay datos de batallas aún</div>
              )}
            </div>

            {/* Pokémon con Mejor Win Rate */}
            <div className="chart-card chart-large">
              <h3>🏆 Top Pokémon por Win Rate</h3>
              {topWinners.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topWinners}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="winRate" fill="#4FACFE" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No hay suficientes datos de batallas</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: USUARIOS */}
      {selectedTab === 'users' && (
        <div className="tab-content">
          <div className="stats-cards-grid">
            <div className="stat-card">
              <h4>👤 Nuevos Usuarios</h4>
              <div className="stat-value">{newUsersCount}</div>
              <div className="stat-description">Usuarios únicos que visitaron por primera vez</div>
            </div>
            <div className="stat-card">
              <h4>🔄 Usuarios Recurrentes</h4>
              <div className="stat-value">{returningUsersCount}</div>
              <div className="stat-description">Usuarios que han regresado</div>
            </div>
            <div className="stat-card">
              <h4>📊 Tasa de Retorno</h4>
              <div className="stat-value">
                {uniqueUsersCount > 0 ? `${((returningUsersCount / uniqueUsersCount) * 100).toFixed(1)}%` : '0%'}
              </div>
              <div className="stat-description">Porcentaje de usuarios que regresan</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Actividad Reciente */}
      <div className="events-table-container">
        <h3>📋 Actividad Reciente</h3>
        {recentEvents.length > 0 ? (
          <table className="events-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Evento</th>
                <th>Detalle</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((evento, idx) => (
                <tr key={idx}>
                  <td>{new Date(evento.timestamp).toLocaleTimeString()}</td>
                  <td>{evento.type}</td>
                  <td>{evento.detail}</td>
                  <td style={{ fontSize: '11px', color: '#999' }}>{evento.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No hay eventos registrados aún</div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;