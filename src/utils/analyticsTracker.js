// src/utils/analyticsTracker.js - VERSIÓN MEJORADA

class AnalyticsTracker {
  constructor() {
    this.userId = this.getUserId();
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.currentPage = null;
    this.pageStartTime = null;
    this.initializeStorage();
    this.detectDevice();
  }

  getUserId() {
    let userId = localStorage.getItem('pokedexUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('pokedexUserId', userId);
    }
    return userId;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // *** NUEVO: Detectar dispositivo y navegador ***
  detectDevice() {
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    
    if (/Mobile|Android|iPhone/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/iPad|Tablet/i.test(ua)) {
      deviceType = 'tablet';
    }
    
    let browser = 'unknown';
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    
    this.deviceInfo = { deviceType, browser };
  }

  initializeStorage() {
    if (!localStorage.getItem('pokedexAnalytics')) {
      const initialData = {
        totalVisits: 0,
        uniqueUsers: [],
        pokemonViews: [],
        generationStats: [],
        typeStats: [],
        dailyVisits: [],
        totalBattles: 0,
        avgSessionTime: 0,
        events: [],
        // *** NUEVAS MÉTRICAS ***
        deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
        browserStats: {},
        hourlyActivity: Array(24).fill(0),
        weeklyActivity: Array(7).fill(0),
        searchTerms: [],
        failedSearches: [],
        battleStats: {
          totalDuration: 0,
          victories: { player1: 0, player2: 0 },
          abandonRate: 0,
          avgTurns: 0
        },
        topMoves: [],
        pokemonWinRate: [],
        pageTimeSpent: {},
        returningUsers: [],
        trendingPokemon: []
      };
      localStorage.setItem('pokedexAnalytics', JSON.stringify(initialData));
    }
  }

  getAnalyticsData() {
    try {
      const data = JSON.parse(localStorage.getItem('pokedexAnalytics') || '{}');
      // Asegurar estructura completa
      data.uniqueUsers = data.uniqueUsers || [];
      data.pokemonViews = data.pokemonViews || [];
      data.events = data.events || [];
      data.deviceStats = data.deviceStats || { mobile: 0, tablet: 0, desktop: 0 };
      data.browserStats = data.browserStats || {};
      data.hourlyActivity = data.hourlyActivity || Array(24).fill(0);
      data.weeklyActivity = data.weeklyActivity || Array(7).fill(0);
      data.searchTerms = data.searchTerms || [];
      data.failedSearches = data.failedSearches || [];
      data.topMoves = data.topMoves || [];
      data.pokemonWinRate = data.pokemonWinRate || [];
      data.pageTimeSpent = data.pageTimeSpent || {};
      data.returningUsers = data.returningUsers || [];
      data.trendingPokemon = data.trendingPokemon || [];
      return data;
    } catch (error) {
      console.error('Error loading analytics data:', error);
      return {};
    }
  }

  saveAnalyticsData(data) {
    try {
      localStorage.setItem('pokedexAnalytics', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }

  // Track page visit (MEJORADO)
  trackPageVisit() {
    try {
      const data = this.getAnalyticsData();
      data.totalVisits = (data.totalVisits || 0) + 1;
      
      // Usuarios únicos
      if (!Array.isArray(data.uniqueUsers)) {
        data.uniqueUsers = [];
      }
      if (!data.uniqueUsers.includes(this.userId)) {
        data.uniqueUsers.push(this.userId);
      } else {
        // *** NUEVO: Track usuario que regresa ***
        if (!data.returningUsers.includes(this.userId)) {
          data.returningUsers.push(this.userId);
        }
      }
      
      // Daily visits
      const today = new Date().toLocaleDateString();
      data.dailyVisits = data.dailyVisits || [];
      const todayEntry = data.dailyVisits.find(d => d.date === today);
      if (todayEntry) {
        todayEntry.visits++;
      } else {
        data.dailyVisits.push({ date: today, visits: 1 });
      }
      
      // *** NUEVO: Track dispositivo ***
      data.deviceStats[this.deviceInfo.deviceType]++;
      
      // *** NUEVO: Track navegador ***
      const browser = this.deviceInfo.browser;
      data.browserStats[browser] = (data.browserStats[browser] || 0) + 1;
      
      // *** NUEVO: Track hora del día ***
      const hour = new Date().getHours();
      data.hourlyActivity[hour]++;
      
      // *** NUEVO: Track día de la semana ***
      const dayOfWeek = new Date().getDay();
      data.weeklyActivity[dayOfWeek]++;
      
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking page visit:', error);
    }
  }

  // Track Pokémon view (MEJORADO)
  trackPokemonView(pokemonId, pokemonName) {
    try {
      const data = this.getAnalyticsData();
      data.pokemonViews = data.pokemonViews || [];
      
      const existingPokemon = data.pokemonViews.find(p => p.id === pokemonId);
      if (existingPokemon) {
        existingPokemon.count++;
        existingPokemon.lastViewed = Date.now();
      } else {
        data.pokemonViews.push({ 
          id: pokemonId, 
          name: pokemonName, 
          count: 1,
          lastViewed: Date.now()
        });
      }
      
      // *** NUEVO: Track Pokémon trending (últimas 24h) ***
      this.updateTrendingPokemon(data, pokemonId, pokemonName);
      
      this.trackEvent('Vista Pokémon', `${pokemonName} (#${pokemonId})`);
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking pokemon view:', error);
    }
  }

  // *** NUEVO: Tracking de Pokémon trending ***
  updateTrendingPokemon(data, pokemonId, pokemonName) {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    data.trendingPokemon = data.trendingPokemon || [];
    
    // Filtrar vistas de las últimas 24h
    data.trendingPokemon = data.trendingPokemon.filter(p => p.timestamp > oneDayAgo);
    
    // Añadir nueva vista
    data.trendingPokemon.push({
      id: pokemonId,
      name: pokemonName,
      timestamp: now
    });
  }

  // *** NUEVO: Track búsqueda (mejorado) ***
  trackSearch(searchTerm, hasResults = true) {
    try {
      const data = this.getAnalyticsData();
      data.searchTerms = data.searchTerms || [];
      
      const existing = data.searchTerms.find(s => s.term === searchTerm);
      if (existing) {
        existing.count++;
      } else {
        data.searchTerms.push({ term: searchTerm, count: 1 });
      }
      
      // *** NUEVO: Track búsquedas sin resultados ***
      if (!hasResults) {
        data.failedSearches = data.failedSearches || [];
        data.failedSearches.push({ term: searchTerm, timestamp: Date.now() });
      }
      
      this.trackEvent('Búsqueda', `Término: ${searchTerm}`);
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // *** NUEVO: Track movimiento usado en batalla ***
  trackMoveUsed(moveName, attackerName, damage) {
    try {
      const data = this.getAnalyticsData();
      data.topMoves = data.topMoves || [];
      
      const existing = data.topMoves.find(m => m.name === moveName);
      if (existing) {
        existing.timesUsed++;
        existing.totalDamage += damage;
        existing.avgDamage = existing.totalDamage / existing.timesUsed;
      } else {
        data.topMoves.push({
          name: moveName,
          timesUsed: 1,
          totalDamage: damage,
          avgDamage: damage
        });
      }
      
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking move:', error);
    }
  }

  // *** NUEVO: Track victoria de Pokémon ***
  trackPokemonVictory(winnerName, loserId) {
    try {
      const data = this.getAnalyticsData();
      data.pokemonWinRate = data.pokemonWinRate || [];
      
      const winner = data.pokemonWinRate.find(p => p.name === winnerName);
      if (winner) {
        winner.wins++;
      } else {
        data.pokemonWinRate.push({ name: winnerName, wins: 1, losses: 0 });
      }
      
      // Track derrota
      const loser = data.pokemonWinRate.find(p => p.id === loserId);
      if (loser) {
        loser.losses++;
      }
      
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking pokemon victory:', error);
    }
  }

  // *** NUEVO: Track tiempo en página ***
  startPageTimer(pageName) {
    this.currentPage = pageName;
    this.pageStartTime = Date.now();
  }

  endPageTimer() {
    if (this.currentPage && this.pageStartTime) {
      const timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000);
      
      try {
        const data = this.getAnalyticsData();
        data.pageTimeSpent = data.pageTimeSpent || {};
        
        if (!data.pageTimeSpent[this.currentPage]) {
          data.pageTimeSpent[this.currentPage] = { total: 0, visits: 0 };
        }
        
        data.pageTimeSpent[this.currentPage].total += timeSpent;
        data.pageTimeSpent[this.currentPage].visits++;
        
        this.saveAnalyticsData(data);
      } catch (error) {
        console.error('Error tracking page time:', error);
      }
      
      this.currentPage = null;
      this.pageStartTime = null;
    }
  }

  // Métodos existentes (sin cambios)
  trackGenerationSelection(generationId, generationName) {
    try {
      const data = this.getAnalyticsData();
      data.generationStats = data.generationStats || [];
      
      const existingGen = data.generationStats.find(g => g.id === generationId);
      if (existingGen) {
        existingGen.value++;
      } else {
        data.generationStats.push({ id: generationId, name: generationName, value: 1 });
      }
      
      this.trackEvent('Cambio Generación', generationName);
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking generation:', error);
    }
  }

  trackTypeFilter(typeName) {
    try {
      const data = this.getAnalyticsData();
      data.typeStats = data.typeStats || [];
      
      const existingType = data.typeStats.find(t => t.type === typeName);
      if (existingType) {
        existingType.count++;
      } else {
        data.typeStats.push({ type: typeName, count: 1 });
      }
      
      this.trackEvent('Filtro Tipo', typeName);
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking type filter:', error);
    }
  }

  trackBattleStart(mode) {
    try {
      const data = this.getAnalyticsData();
      data.totalBattles = (data.totalBattles || 0) + 1;
      
      this.trackEvent('Batalla Iniciada', `Modo: ${mode}`);
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking battle start:', error);
    }
  }

  trackEvent(eventType, eventDetail) {
    try {
      const data = this.getAnalyticsData();
      data.events = data.events || [];
      
      data.events.push({
        type: eventType,
        detail: eventDetail,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId
      });
      
      if (data.events.length > 100) {
        data.events = data.events.slice(-100);
      }
      
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  trackSessionEnd() {
    try {
      const sessionDuration = Math.floor((Date.now() - this.sessionStart) / 1000);
      const data = this.getAnalyticsData();
      
      const totalSessions = data.totalVisits || 1;
      const currentAvg = data.avgSessionTime || 0;
      data.avgSessionTime = Math.floor((currentAvg * (totalSessions - 1) + sessionDuration) / totalSessions);
      
      this.saveAnalyticsData(data);
    } catch (error) {
      console.error('Error tracking session end:', error);
    }
  }
}

const tracker = new AnalyticsTracker();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    tracker.trackSessionEnd();
  });
}

export default tracker;