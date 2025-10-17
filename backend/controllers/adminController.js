exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Простая проверка
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Логин и пароль обязательны' 
      });
    }
    
    // Временная логика - всегда успешный вход
    console.log('Admin login attempt:', username);
    
    res.json({ 
      success: true, 
      message: 'Успешный вход',
      token: 'temp-token'
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при входе' 
    });
  }
};