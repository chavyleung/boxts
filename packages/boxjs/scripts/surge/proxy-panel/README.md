# @boxts/surge-proxy-panel

在 Surge Panel 中显示机场剩余流量、订阅时间等信息

## 配置说明:

```properties
[Script]
surge-proxy-panel.js = type=generic,script-path=scripts/surge-proxy-panel.js,argument=sub=[订阅链接]

[Panel]
panel-nexitally = title=Nexitally,style=info,script-name=surge-proxy-panel.js,update-interval=60
```

## 支持机场:

1. Nexitally
