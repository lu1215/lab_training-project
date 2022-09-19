"""project1 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from web_tool import views #匯入你的 web_tool/view.py

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('hello/', views.hello_world), #新增網址與對應的動作
    # path('', views.index),
    
    #因之後上伺服器時大家初始網址相同,為避免混淆故多使用下一層作為網址
    path('web_tool/', include('web_tool.urls')), 
    
]
