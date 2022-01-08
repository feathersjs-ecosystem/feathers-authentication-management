const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("./Login.vue")
  },
  {
    path: "/singup",
    name: "Signup",
    component: () => import("./Signup.vue");
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("./ForgotPassword.vue")
  },
  {
    path: "/change-password",
    name: "ChangePassword",
    component: () => import ("./ChangePassword.vue")
  },
  {
    path: "/verify-email/:token",
    name: "VerifyMail",
    component: () => import("./VerifyMail.vue"),
    props: true
  }
]
