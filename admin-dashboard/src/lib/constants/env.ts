export const NODE_ENV = import.meta.env.MODE

export const IS_DEV = NODE_ENV === 'development'

export const WEB_SERVER_URL = import.meta.env.VITE_WEB_SERVER_URL ?? 'http://localhost:3000/api'
