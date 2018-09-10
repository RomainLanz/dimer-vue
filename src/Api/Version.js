/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * The version instance for a given version inside a given zone.
 *
 * You will never have to construct this class manually, and instead use
 * the `version` method on the Zone class.
 *
 * @class Version
 *
 * @param {String} zoneSlug
 * @param {Object} version
 * @param {Object} axios
 * @param {Object} options
 */

import axios from 'axios'

export class Version {
  constructor (zoneSlug, version, axios, docUrlPattern) {
    if (!docUrlPattern) {
      throw new Error('docUrlPattern is required to get instance for the current version')
    }

    this.zoneSlug = zoneSlug
    this.version = version
    this.axios = axios
    this.docUrlPattern = docUrlPattern
    this.searchSource = null

    /**
     * The base API url for the dimer rest server
     */
    this.baseApiUrl = `${this.zoneSlug}/versions/${this.version.no}`

    /**
     * The baseApp URL is the URL of the vue app and
     * not the API.
     */
    this.baseAppUrl = this.docUrlPattern
      .replace(':zone', this.zoneSlug)
      .replace(':version', this.version.no)
      .replace(/^\//, '')

    /**
     * Caching created URL's to avoid re-parsing
     *
     * @type {Object}
     */
    this.cachedUrls = {}
  }

  /**
   * Returns the documentation tree
   *
   * @method getTree
   *
   * @return {Array}
   */
  async getTree () {
    const response = await this.axios.get(`${this.baseApiUrl}.json`)
    return response.data
  }

  /**
   * Returns the doc contents
   *
   * @method getDoc
   *
   * @param  {String}  permalink
   * @param  {Boolean} [splitToc = false] Split toc to it's own property
   *
   * @return {Object}
   */
  async getDoc (permalink) {
    const response = await this.axios.get(`${this.baseApiUrl}/${permalink}.json`)
    return response.data
  }

  /**
   * Search documentation inside this version
   *
   * @method search
   *
   * @param  {String} query
   * @param  {Number} limit
   *
   * @return {Array}
   */
  async search (query, limit = 10) {
    if (!query) {
      return []
    }

    /**
     * Cancel old search request, when new has been made
     */
    if (this.searchSource) {
      this.searchSource.cancel()
    }

    this.searchSource = axios.CancelToken.source()

    try {
      const response = await this.axios.get(`${this.baseApiUrl}/search.json`, {
        params: { query, limit }
      }, {
        cancelToken: this.searchSource.token
      })

      this.searchSource = null

      return response.data
    } catch (error) {
      if (!axios.isCancel(error)) {
        throw error
      }
    }
  }

  /**
   * Make url for a permalink
   *
   * @method makeUrl
   *
   * @param  {String} permalink
   *
   * @return {String}
   */
  makeUrl (permalink) {
    if (!this.cachedUrls[permalink]) {
      this.cachedUrls[permalink] = `/${this.baseAppUrl.replace(':permalink', permalink.replace(/^\/|\/$/g, ''))}`
    }

    return this.cachedUrls[permalink]
  }
}
