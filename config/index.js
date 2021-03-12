module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'JKHSJHFKLJFKLMSDFSD45F453S4FS453423DF564654SDFSDFLKSDLLDFJKLSJFJSDNFS56456',
  api: process.env.NODE_ENV === 'production' ? 'https://site-api.com.br' : 'http://localhost:3000',
  loja: process.env.NODE_ENV === 'production' ? 'https://site.com.br' : 'http://localhost:8000'
}