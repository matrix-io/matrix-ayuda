/**
 * Configuration for test
 */

module.exports = {

    /**
     * Ayuda uses Basic Auth
     */
    username: process.env.AY_API_USER,
    password: process.env.AY_API_PASSWORD,
    apiUrl    : process.env.AY_API_URL   || 'https://client.ayudapreview.com/Juice/pi',

}
