Dpd  一个简单的前端部署工具
=========================


## 安装

~~~
npm install
node server.js
~~~

## 使用步骤

1. 在需要自动部署的项目中加入 deployment.json 部署描述文件
2. GitLab 中添加项目 WebHook，指向本服务地址
3. 大功告成

## deployment.json 说明

~~~
{
  "name": "name",
  "type": "gulp", // 构建工具类型
  "targets": [
    {
      "name": "prod", // 构建目标名称
      "src": "dist", // 待部署目录，相对与项目跟目录
      "dst": "/path/to/target", // 部署后路径，绝对路径
      "build": "gulp build-prod" // 构建项目执行的命令，可省略，默认 gulp build 或者 grunt build
    }
   ]
}
~~~
