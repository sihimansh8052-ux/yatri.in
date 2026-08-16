const tokenBucket = new Map();

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return value.replace(/[<>]/g, "").trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    return sanitizeObject(value);
  }
  return value;
};

const sanitizeObject = (object) =>
  Object.fromEntries(
    Object.entries(object)
      .filter(([key]) => !key.startsWith("$") && !key.includes("."))
      .map(([key, value]) => [key, sanitizeValue(value)])
  );

export const securityHeaders = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0");
  next();
};

export const sanitizeInput = (req, _res, next) => {
  if (req.body && typeof req.body === "object") req.body = sanitizeObject(req.body);
  if (req.query && typeof req.query === "object") req.query = sanitizeObject(req.query);
  next();
};

export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 120 } = {}) => (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  const record = tokenBucket.get(key) || { count: 0, start: now };

  if (now - record.start > windowMs) {
    record.count = 0;
    record.start = now;
  }

  record.count += 1;
  tokenBucket.set(key, record);

  if (record.count > max) {
    return res.status(429).json({ message: "Too many requests. Please try again shortly." });
  }

  next();
};

export const csrfProtection = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (process.env.CSRF_PROTECTION !== "true") return next();

  const csrfHeader = req.headers["x-csrf-token"];
  const csrfCookie = req.headers.cookie
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("csrfToken="))
    ?.split("=")[1];

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
};
