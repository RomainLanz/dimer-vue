/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { Version } from './Version'

/**
 * The instance for a given zone. You can call methods to pull a
 * version instance.
 *
 * You will never have to construct this class manually, and instead use
 * the `zone` method on the Dimer class.
 *
 * @param {Object} zone
 * @param {Object} axios
 * @param {Object} options
 */
export class Zone {
  constructor (zone, axios, options) {
    this.zone = zone
    this.axios = axios
    this.options = options
  }

  /**
   * Returns an array of versions for a given zone
   *
   * @method getVersions
   *
   * @return {Array}
   */
  getVersions () {
    return this.zone.versions
  }

  /**
   * Returns the version instance for a given version no. The version no
   * will be validated inside the initially loaded versions
   *
   * @method version
   *
   * @param  {String} versionNo
   *
   * @return {Version}
   */
  version (versionNo) {
    const version = this.zone.versions.find((version) => version.no === versionNo)
    if (!version) {
      throw new Error(`Version ${versionNo} doesn't exists inside ${this.zone.slug} zone`)
    }

    return new Version(this.zone.slug, version, this.axios, this.options)
  }

  /**
   * Returns an instance of the default version for the given zone
   *
   * @method defaultVersion
   *
   * @return {Version}
   */
  defaultVersion () {
    const version = this.zone.versions.find((version) => !!version.default)
    if (!version) {
      throw new Error(`${this.zone.slug} zone doesn't have a default version`)
    }

    return new Version(this.zone.slug, version, this.axios, this.options)
  }
}
