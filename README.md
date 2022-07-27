# Transform Helper

这个扩展插件可以通过` const 用户名 `自动翻译成 ` const userName`，解决命名焦虑；

![描述](./translate.gif)

## 设置


| Name|Description|
| ------------------------- | ---------------------------------- |
| `transform-helper.appid`|百度翻译appid |
| `transform-helper.key` | 百度翻译私人账户秘钥 |
| `transform-helper.time` | 输入翻译文字后几秒触发翻译（默认1500，低于1000的配置不生效） |

最后建议大家自己申请一个百度翻译通用api（代码中是我申请的通用版本的翻译api，翻译字节数有限，当然目前只支持百度翻译，后续有更好的翻译工具厂商，大家可以告诉我，我去增加），将appid、秘钥写入配置，重启即可生效
