/**
 * 设置 CORS 头并处理 OPTIONS 请求
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Boolean} 如果是 OPTIONS 请求，返回 true；否则返回 false
 */
const handleCors = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // 替换为前端的实际地址
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  
    // 如果是 OPTIONS 请求，直接返回 204 状态码
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return true;
    }
  
    return false;
  };
  
  module.exports = handleCors;