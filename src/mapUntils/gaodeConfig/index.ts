import AMapLoader from "@amap/amap-jsapi-loader";
const key="844130b00a6dac7af9de648c555194a5"
export default class GaodeMap { 
    element: string|null=null;
    viewer: any = null;
    constructor(element: string) { 
        this.element = element;
    }
    init() {
        AMapLoader.load({
            key: key, // 申请的web api key
            version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: ['AMap.Scale', 'AMap.ToolBar'], // 需要使用的的插件列表，如比例尺'AMap.Scale'
        }).then((AMap) => {
             var defaultLayer = new AMap.createDefaultLayer();
            let disCountry = new AMap.DistrictLayer.Country({
                zIndex: 15,
                SOC: "CHN",
                depth: 0,
                styles: {
                    "nation-stroke": "#bbdaf1",
                    "coastline-stroke": "#bbdaf1",
                    "province-stroke": "#bbdaf1",
                    "city-stroke": "#bbdaf1",
                    fill: "rgba(0,0,0,0.2)",
                },
            });
            let province = new AMap.DistrictLayer.Province({
                zIndex: 20,
                depth: 0,
                styles: {
                    "province-stroke": "#bbdaf1",
                    "city-stroke": "#bbdaf1",
                    fill: "rgba(0,0,0,0.2)",
                },
            })
            return new AMap.Map(this.element, {
                //设置地图容器id
                zoom: 3.9, //初始化地图级别
                mapStyle:
                    "amap://styles/2ffb5989679be06db1a654bbdc48ffae", //设置地图的显示样式
                center: [106.284947, 38.794041],
                layers: [
                  disCountry,
                  defaultLayer // disCountry 跟 defaultLayer 一定要搭配使用 不然只使用 disCountry 会导致不显示省市名称
                ],
            });
        })
        .catch((e) => {
            console.log(e);
        });
    }
}