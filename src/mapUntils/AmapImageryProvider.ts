 
import AmapMercatorTilingScheme from './AmapMercatorTilingScheme'
const Cesium = (window as any).Cesium
//影像（无标注）
const IMG_URL = 'https://webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}'
//电子(无标注)
const VEC_URL = 'https://wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&ltype=3&x={x}&y={y}&z={z}'
//道路(无标注)
const ROAD_URL = 'https://webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&ltype=11&x={x}&y={y}&z={z}'
 //电子（有标注）
const VEC_LABEL_URL = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
//道路（有标注）
const ROAD_LABEL_URL = 'http://webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
 
class AmapImageryProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options: any = {}) {
    options['url'] = VEC_LABEL_URL
    if (!options.subdomains || !options.subdomains.length) {
      options['subdomains'] = ['1', '2', '3', '4']
    }
    if (options.crs === 'WGS84') {
      options['tilingScheme'] = new AmapMercatorTilingScheme()
    }
    super(options)
  }
}
export default AmapImageryProvider