from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('hello/', views.hello_world),
    path('project',views.project),
    path('test', views.test),
    path('form/', views.form),
    path('ajax_data/', views.ajax_data),
    path('crawler/' , views.crawler),
    path('hw_23/', views.hw_23),
    path('hw_4/', views.hw_4),
    path('show_data/', views.show_data),
    path('gene_strcture_graph/', views.gene_strcture_graph),
    path('crawler_and_processing/', views.crawler_and_processing),
    path('d3_graph/', views.d3_graph),
    path('piTarPrediction/', views.piTarPrediction),
    path('crawler_gene/', views.crawler_gene),
    path('transcript_pages/',views.transcript_page),
]