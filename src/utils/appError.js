// Создаем пользовательский класс ошибок для приложения
class AppError extends Error {
    constructor(message, statusCode) {
        // Вызываем конструктор родительского класса Error с сообщением об ошибке
        super(message);
        // Сохраняем HTTP статус-код ошибки (например, 404, 500)
        this.statusCode = statusCode;
        // Определяем статус ошибки:
        // - если код начинается с '4' (клиентские ошибки: 400-499) → "fail"
        // - если код начинается с '5' (серверные ошибки: 500-599) → "error"
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        
        // Отмечаем, что эта ошибка является ожидаемой/операционной
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
// Экспортируем класс для использования в других модулях
export default AppError;