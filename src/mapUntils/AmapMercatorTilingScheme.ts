/*
 * @Description: 
 * @Author: maizi
 * @Date: 2023-04-03 17:36:41
 * @LastEditTime: 2023-04-03 21:02:36
 * @LastEditors: maizi
 */
import gcoord from 'gcoord';
 
const Cesium= window.Cesium
class AmapMercatorTilingScheme extends Cesium.WebMercatorTilingScheme {
  constructor(options:any={}) {
    super(options)
    let projection = new Cesium.WebMercatorProjection()
    this._projection.project = function(cartographic:any, result:any) {
      //WGS84转GCJ02坐标
      result = gcoord.transform([
        Cesium.Math.toDegrees(cartographic.longitude), 
        Cesium.Math.toDegrees(cartographic.latitude)
      ], gcoord.WGS84, gcoord.GCJ02)
      result = projection.project(
        new Cesium.Cartographic(
          Cesium.Math.toRadians(result[0]),
          Cesium.Math.toRadians(result[1])
        )
      )
      return new Cesium.Cartesian2(result.x, result.y)
    }
    this._projection.unproject = function(cartesian:any, result:any) {
      let cartographic = projection.unproject(cartesian)
       //GCJ02转WGS84坐标
      result = gcoord.transform([
        Cesium.Math.toDegrees(cartographic.longitude), 
        Cesium.Math.toDegrees(cartographic.latitude)
      ], gcoord.GCJ02, gcoord.WGS84)
 
      return new Cesium.Cartographic(
        Cesium.Math.toRadians(result[0]),
        Cesium.Math.toRadians(result[1])
      )
    }
  }
}
 
export default AmapMercatorTilingScheme