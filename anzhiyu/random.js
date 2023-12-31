var posts=["2023/12/30/hello-world/","2019/04/17/React进阶训练/","2020/08/23/JavaScript常用方法集/","2023/02/19/Git异常处理/","2018/11/13/JavaScript知多少/","2023/02/18/Git操作文档/","2019/05/08/jQuery选择器/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };