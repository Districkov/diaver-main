exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    console.log('Contact form submitted:', { name, email, message });
    
    res.json({ 
      success: true, 
      message: 'Сообщение отправлено' 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при отправке сообщения' 
    });
  }
};