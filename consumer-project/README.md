# 项目组件业务接入参考

独立 React / Vite 工程，安装隔离验收项目包，通过自己的 HTTP 接口读取、校验、保存资源。没有引用管理站源码，不连接用户实际工作区。

```sh
npm install
npm run build
npm test
npm run dev
```

入口：http://127.0.0.1:4186/；业务接口仅监听 127.0.0.1:4187。资源保存在 `.data/resources.json`。此接口用于接入参考，不提供生产鉴权。

`expected-release.json` 明确宿主要求的项目、版本、运行时与快照；不匹配时停止展示。`ControlledForm.tsx` 来自已安装项目包，并参与类型检查。

演示包来自 `artifacts/project-delivery-acceptance/` 的隔离测试版本。真实工程应替换成版本页下载的包，修改依赖及宿主版本要求，并连接业务工程自己的接口。

完整交付说明见 `../docs/PROJECT-DELIVERY-IMPLEMENTATION.md`。根目录执行 `node scripts/verify-project-consumer.mjs` 可重新验证回退到 9.0.0、升级到 9.1.0；执行前应停止本参考工程开发服务，完成后重新启动以清理预构建缓存。
