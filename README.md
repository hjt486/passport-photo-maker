<div id="top"></div>
<br />
<div align="center">
  <a href="https://jiataihan.dev/passport-photo-maker/">
    <img src="public/logo512.png" alt="Logo" width="128" height="128">
  </a>

<h3 align="center">护照签证照片生成器 | Passport & Visa Photo Maker</h3>

  <p align="center">
    不需要任何图像处理知识，只需要简单的动动鼠标，就可以快速生成符合不同国家标准的护照或签证照片。
    <br />
    <strong>注：目前仅支持运行在Windows平台。</strong>
    <br />
    <br />
    <a href="https://jiataihan.dev/passport-photo-maker/"><strong>{ 点击开始使用 }</strong></a>
    <br />
    <a href="https://www.youtube.com/watch?v=Q86svYysahA"><strong>{ 点击查看视频教程 }</strong></a>
    <br />
    (注：视频教程使用老版Windows程序，但使用参考线方法一致，可参考)
  </p>

</div>


<!-- ABOUT THE PROJECT -->
## 简介
<div align="center">
    <a href="https://jiataihan.dev/passport-photo-maker/">
        <img src="public/preview.png" alt="程序界面预览" width="400"">
    </a>
</div>

### 特点

* 网页版，自适应界面，可跨平台，跨设备使用（完美支持手机浏览器访问）
* 中英文双语界面，实时切换（已支持多语言，后期有必要可以轻易扩展）
* 多个国家的签证和护照照片模板以及参考信息，用JSON定义，可以快速添加
* 可以鼠标/触摸直接操作图像区域，也可以用微调工具单击微调
* 图像平移缩放旋转可实时预览
* 可以设置输出尺寸，以及输出大小（上限）

<p align="right">(<a href="#top">回到页首</a>)</p>

疫情开始以来，世界各地的中国使领馆均改变了对外办公的时间和方式，使得护照到期换发变的更加麻烦。以前经常有朋友抱怨使领馆对于照片的要求过于苛刻，很多通过第三方拍摄的照片都无法通过验证，但是疫情前的使领馆内部或附近都有相应的自助照片拍摄机器，或者了解相关标准的第三方摄影馆，除了额外的费用和一定的时间成本，绝大多数的情况下并不会耽误护照换发申请流程。如今因为很多使领馆不对外开放，同时引入了领事服务App，因此申请人需要在申请前期就要上传符合标准的照片，即便照片通过了初步验证，如果不符合具体要求，依然可能在后期审核过程中被拒绝，极大程度上增加了不确定性和时间成本。实际上，中国外交部领事服务网上发布的关于护照照片的标准非常清晰和详细，对于照片上人像的各种距离、大小均有明确的规定，但是对于绝大多数人，这些枯燥和详细的数字只是增加了理解的难度，同时因为缺乏处理照片的相关知识，使得很多人感觉无从下手又不知道去哪里寻求帮助。这个程序的存在，就是为了帮助大家化繁为简，用清晰明了的可视化的方式快速生成符合标准的照片。

<p align="right">(<a href="#top">回到页首</a>)</p>

### Built With

* React
* JavaScript
* Node.js

<p align="right">(<a href="#top">回到页首</a>)</p>

### 已知问题

* <del>平移框拖拽时会超出画布界限的问题</del> (fixed: 2024-01-25)
* iOS下保存图片，并非存放于相机胶卷，而是自动保存至文件里，没有提示，可能需要额外处理iOS系统下保存文件的行为；
* 初始阶段需要拖拽几次后才能正常平移，原因是第一次缩放时位移坐标没有正确初始化，会择机修复；
* 图像大小是以网页实际画布大小为基础，假设中国护照照片是330x480px，在输出处调整大小也仅仅是插值拉伸，画质有较大损失，解决方法有两种：1，让画布本身变大，显示时等比缩小保证网页显示正确，输出时输出原画布大小；2，在输出时重新载入原图，利用记录的缩放平移坐标计算在原图基础上输出图像。鉴于护照签证照片一般文件尺寸要求都偏小，方案1目前更可靠。

<p align="right">(<a href="#top">回到页首</a>)</p>



### 待添加功能

* 手指多点触摸旋转；
* 自动去背景功能；
* 生成6x4等可以直接打印出来标准相片尺寸的图像
* （欢迎在讨论区留言建议，或者其他开发者建立新的Branch来添加新功能）。

<p align="right">(<a href="#top">回到页首</a>)</p>

<div>
