import createLogger from 'logging'
import debugLogger from 'debug'

import response from './response'
import {
  productValidation,
  recaptcha as recaptchaConfig
} from './config'
import {
  Recaptcha
} from 'express-recaptcha'

const logger = createLogger('sourceValidate.js')
const debug = debugLogger('validation:bypass')

const recaptcha = new Recaptcha(recaptchaConfig.siteKey, recaptchaConfig.secretKey)

export default function sourceyValidate (validationOptions = productValidation) {
  return function (req, res, next) {
    if (req.headers['referer'] === validationOptions.referrerAppleiOS || req.headers['referer'] === validationOptions.referrerAndroid) {
      if (validationOptions.apiKeys.includes(req.headers[validationOptions.apiKeyHeaderName])) {
        req.recaptcha = {}
        debug('Mobile Bypass Success')
        next()
      } else {
        logger.error('Invalid API key')
        response.error(res, 'Invalid API key')
      }
    } else if (validationOptions.specialWebOrigins.includes(req.headers['origin'])) {
      req.recaptcha = {}
      debug('Web Bypass Success')
      next()
    } else if (/quote/.test(req.route.path)) {
      next()
    } else {
      return recaptcha.middleware.verify(req, res, next)
    }
  }
}
