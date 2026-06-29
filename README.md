 # 💕 Only Us - 情侣纪念网站
 
 > 打开网页像进入一本会动的恋爱纪念册。
 > 移动端优先 · 可部署 · 可微信分享
 
 ---
 
 ## 📦 项目结构
 
 ```
 /
 ├── index.html        # 主页面
 ├── style.css         # 全部样式
 ├── script.js         # 全部交互逻辑
 ├── config.js         # 所有内容配置（改这里）
 ├── images/
 │   ├── hero/         # 首页轮播背景图
 │   ├── album/        # 相册图片
 │   └── story/        # 故事图片
 ├── music/
 │   └── love.mp3      # 背景音乐
 └── README.md         # 本文件
 ```
 
 ---
 
 ## 🖼️ 如何替换图片
 
 ### 1. 首页轮播图
 1. 准备 **5 张** 情侣照片，建议尺寸 800×900px 以上
 2. 放入 `images/hero/` 目录
 3. 文件名建议 `hero-1.jpg` ~ `hero-5.jpg`
 4. 打开 `config.js`，修改 `heroImages` 数组中的路径
 
 ```js
 heroImages: [
   { src: '/images/hero/hero-1.jpg' },
   { src: '/images/hero/hero-2.jpg' },
   // ...
 ]
 ```
 
 ### 2. 相册图片
 1. 准备照片，建议宽度 400px 以上
 2. 放入 `images/album/` 目录
 3. 打开 `config.js`，在 `albumImages` 数组中添加/修改条目
 
 ```js
 albumImages: [
   {
     src: '/images/album/xxx.jpg',  // 图片路径
     date: '2020-03-14',            // 日期
     title: '第一次约会',            // 标题
     description: '那天的阳光正好',  // 描述文字
   },
   // ...
 ]
 ```
 
 ### 3. 故事图片
 1. 放入 `images/story/` 目录
 2. 在 `config.js` 的 `stories` 数组中指定图片路径
 
 ---
 
 ## 🎵 如何替换音乐
 
 1. 准备一首 MP3 格式的背景音乐
 2. 命名为 `love.mp3`（或其他名字）
 3. 放入 `music/` 目录
 4. 打开 `config.js`，修改 `music` 相关配置
 
 ```js
 music: {
   enabled: true,
   src: '/music/love.mp3',       // 音乐文件路径
   title: 'Love Story',          // 显示的歌名
   artist: '我们的歌',            // 歌手
   autoplay: false,              // 是否自动播放（微信禁止自动播放）
   volume: 0.5,                  // 默认音量 0-1
   playlist: [
     { src: '/music/love.mp3', title: 'Love Story', artist: '未知' },
     // 可添加更多歌曲
   ],
 },
 ```
 
 > 💡 微信浏览器禁止自动播放，用户需要点击音乐按钮手动播放。
 
 ---
 
 ## ✏️ 如何修改文字
 
 所有文字内容均在 `config.js` 中配置，无需修改 HTML 文件：
 
 | 配置项 | 说明 | 示例 |
 |--------|------|------|
 | `basic.title` | 网站主标题 | `'Only Us'` |
 | `basic.subtitle` | 副标题 | `'Every moment with you matters.'` |
 | `basic.footer` | 页尾文字 | `'💕 永远热恋中 💕'` |
 | `anniversary.startDate` | 纪念日日期 | `'2020-01-01'` |
 | `quotes` | 情话列表 | 数组，每项一句 |
 | `easterEgg.message` | 隐藏彩蛋文字 | `'谢谢你出现在我的生命里'` |
 | `confession.message` | 告白模式文字 | `'以后也一起走吧 💕'` |
 | `buttons` | 所有按钮文案 | 对象 |
 | `colors` | 主题颜色 | 对象 |
 
 ---
 
 ## 🌐 如何部署
 
 ### GitHub Pages（免费 · 推荐）
 
 1. 在 GitHub 新建仓库
 2. 将所有文件上传到仓库（保持文件结构）
 3. 进入仓库 **Settings → Pages**
 4. Source 选择 **Deploy from a branch**
 5. Branch 选择 **main**，目录选 **/(root)**
 6. 点击 **Save**
 7. 等待几分钟，访问 `https://你的用户名.github.io/仓库名/`
 
 ### Vercel（免费 · 更快）
 
 1. 将项目上传到 GitHub 仓库
 2. 访问 [vercel.com](https://vercel.com)，用 GitHub 登录
 3. 点击 **Add New → Project**
 4. 导入你的仓库
 5. 保持默认设置（Framework 选 **Other**）
 6. 点击 **Deploy**
 7. 完成后会得到一个 `xxx.vercel.app` 的链接
 
 ---
 
 ## 💬 如何分享到微信
 
 ### 方法一：直接发送链接
 
 1. 部署完成后，复制你的网页链接
 2. 发送给微信好友或分享到朋友圈
 3. 对方点击即可打开
 
 ### 方法二：生成二维码
 
 1. 使用 [草料二维码](https://cli.im/) 或其他工具
 2. 输入你的网页链接
 3. 生成二维码图片
 4. 将二维码发送给好友扫描
 
 > ⚠️ **重要提示：**
 > - 微信内打开外部链接可能会有安全提示，属于正常现象
 > - 如果使用 GitHub Pages，确保仓库设置为 **Public**
 > - 建议使用自己的域名以获得更好的微信兼容性
 
 ### 微信分享优化
 
 在 `index.html` 的 `<head>` 中已预设了微信分享标签：
 ```html
 <meta property="og:title" content="Only Us">
 <meta property="og:description" content="Every moment with you matters.">
 <meta property="og:image" content="/images/og-image.jpg">
 ```
 
 替换 `og:image` 中的图片路径为你自己的分享缩略图（建议 1200×630px）。
 
 ---
 
 ## 🎨 功能介绍
 
 | 功能 | 说明 |
 |------|------|
 | 📸 首页轮播 | 5 张照片自动轮播，轻模糊背景，打字机效果 |
 | 🖼️ 瀑布流相册 | 自适应列数，点击放大，左右滑动切换 |
 | 📖 故事时间轴 | 点击卡片展开详情，回顾重要时刻 |
 | 💌 情话轮播 | 玻璃拟态卡片，自动翻页，支持随机播放 |
 | ✨ 互动区 | 单击爱心、双击爱心雨、长按告白模式 |
 | 💝 纪念日倒计时 | 显示在一起的天/时/分，翻牌动画，流星背景 |
 | 🌊 漂流瓶 | 写给对方的留言，保存到本地，可删除 |
 | 🎵 背景音乐 | 右上角悬浮控制，旋转唱片动画 |
 | 🥚 隐藏彩蛋 | 连续点击 Logo 7 次，触发惊喜页面 |
 
 ---
 
 ## ⚡ 性能优化建议
 
 - 所有图片建议使用 **WebP** 格式以获得更小的文件体积
 - 首页轮播图建议控制在 **200KB** 以内
 - 背景音乐建议使用 **128kbps** 码率，文件控制在 **5MB** 以内
 - 如果微信内加载慢，可以先压缩图片再上传
 
 ---
 
 ## 📄 技术栈
 
 - HTML5 + CSS3 + JavaScript（原生）
 - [GSAP](https://gsap.com/) - 动画引擎
 - [tsParticles](https://particles.js.org/) - 粒子系统
 - [Font Awesome](https://fontawesome.com/) - 图标库
 - [Google Fonts](https://fonts.google.com/) - 字体服务
 
 ---
 
 Made with ❤️
