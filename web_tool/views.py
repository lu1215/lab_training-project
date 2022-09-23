from email import message
from tokenize import Name
from tracemalloc import start
from urllib import response
from django.shortcuts import render #渲染頁面用
from django.http import HttpResponse #匯入http模組
from datetime import datetime
import pandas as pd
import json
from .models import Gene
from django.db import connection
from web_tool.models import User
from web_tool import models, forms
from django.http import JsonResponse
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
import os
import re
import time
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import argparse
import sys
import ast
import csv
from multiprocessing import Process, Lock, Queue ,JoinableQueue, active_children
import math
import operator
import requests

def hello_world(request):
    # return HttpResponse("Hello World!")
    time = datetime.now()
    return render(request, 'hello_world.html', locals()) 
    #local() 會將所有變數 (ex time 可以被丟回html) 打包丟往前端

# 讀取xlsx檔案用的方式
# def index(request):

#     df = pd.read_csv('data/hw1.csv')
#     df = df.head(10)
#     df = df.rename(columns={"Gene_ID": "id",
#                             "transcript_ID": "transcript",
#                             "# of transcripts": "number",
#                             })
#     json_string = df.to_json(orient='records')
#     genes = json.loads(json_string)


#     return render(request, 'index.html', locals()) 

# transcript分析頁面
def transcript_page(request):
    
    return render(request, 'transcript.html', locals()) 

# 將資料庫資料讀取的方式
def index(request):
    genes = Gene.objects.all()
    return render(request, 'index.html', locals())

def project(request):
    return render(request, 'project.html', locals()) 

def test(request):
    return render(request, 'test.html', locals()) 

# form test

def dictfetchall(cursor):
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def form(request):
    # SQL Test
    try:
        id = request.POST['user_id']
        password = request.POST['user_pass']
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM web_tool_user WHERE user_id='{}' AND user_pass='{}'".format(id,password))
        user = dictfetchall(cursor)
        
        if user:
            message = user[0]['user_content']
        else:
            message = "ID or Password not found."
            
    except:
        pass

    # ORM Test
    try:
        id2 = request.POST['user_id']
        password2 = request.POST['user_pass']
        user2 = User.objects.filter(user_id=id2, user_pass=password2)

        if user2:
            message2 = user2[0].user_content
        else:
            message2 = "ID or Password not found."
            
    except:
        pass
    
    # return render(request, 'form.html', locals())

    # ModelForm
    if request.method == 'POST':
        user_form = forms.UserForm(request.POST)
        if user_form.is_valid():
            user_form.save()
            message3 = 'Saved successfully.'
        else:
            message3 = 'Something wrong, please check again.'
    else:
        user_form = forms.UserForm()
    
    return render(request, 'form.html', locals()) 

def crawler(request):

    # query = request.POST['content']
    query = str(request.POST['content'])
    driver = webdriver.Chrome("/home/cosbi/Documents/Web Crawler/chromedriver")
    driver.get('https://wormbase.org/species/c_elegans/transcript/{}'.format(query))
    if query == "": 
        driver.quit()
    else:
        time.sleep(1)
        driver.find_element(By.LINK_TEXT, query).click()
        time.sleep(1)
        driver.find_element(By.XPATH,"/html/body/div[2]/div[5]/div[3]/div[2]/div[1]/li[12]/div/div[2]/div[2]/div[1]/div[2]/div/div/div[2]/div/button[2]").click()
        time.sleep(1)
        driver.quit()

def hw_23(request):
    query = request.POST['content']
    f = open('/home/cosbi/Downloads/unspliced+UTRTranscriptSequence_{}.fasta'.format(query),'r')
    lines=f.readlines()
    f.close()

    gene_list = []
    gene_list.append(lines[1])

    Name = []
    start = []
    end = []

    become_upper = 0

    for j in range(len(gene_list[0])):
        if j == 0:
            continue
        if (ord(gene_list[0][j])>=65  and ord(gene_list[0][j]) <=90) and (ord(gene_list[0][j-1])>=97  and ord(gene_list[0][j-1]) <=122) :
            become_upper += 1
            continue

    print("become_upper",become_upper)

    UTR5_start = 1
    UTR5_end = 0

    for j in range(len(gene_list[0])):
        if ord(gene_list[0][j])>=65  and ord(gene_list[0][j]) <=90 :
            UTR5_end = j-1 +1 
            print("UTR5_start = ",UTR5_start)
            print("UTR5_end = ",UTR5_end)
            break
    UTR5_length = UTR5_end-UTR5_start +1

    Name.append("5'UTR")
    start.append(UTR5_start)
    end.append(UTR5_end)

    Name.append("CDS")
    start.append(0)
    end.append(0)

    UTR3_start = 0
    UTR3_end = len(gene_list[0])
    for j in range(len(gene_list[0])-1,0,-1):
        if ord(gene_list[0][j])>=65  and ord(gene_list[0][j]) <=90 :
            UTR3_start = j+1 +1
            print("UTR3_start = ",UTR3_start)
            print("UTR3_end = ",UTR3_end)
            break
    UTR3_length = UTR3_end-UTR3_start +1

    Name.append("3'UTR")
    start.append(UTR3_start)
    end.append(UTR3_end)

    if UTR5_length != 0:
        number_Exon = become_upper
        number_Intron = number_Exon -1

        i = 1 # 算number_Exon
        k = 1 # 算number_Intron
        for j in range(len(gene_list[0])):
            if j == 0:
                continue
            if (ord(gene_list[0][j])>=65  and ord(gene_list[0][j]) <=90) and (ord(gene_list[0][j-1])>=97  and ord(gene_list[0][j-1]) <=122) and (i <= number_Exon): #遇到小寫變大寫時
                
                if i ==1:
                    name_1 = "Exon"+str(i)
                    Name.append(name_1)
                    start.append(1)
                    i += 1
                else:
                    name_1 = "Exon"+str(i)
                    Name.append(name_1)
                    start.append(j+1)
                    end.append(j-1+1)
                    i += 1


            if (ord(gene_list[0][j-1])>=65  and ord(gene_list[0][j-1]) <=90) and (ord(gene_list[0][j])>=97  and ord(gene_list[0][j]) <=122) and (k <=  number_Intron): #遇到大寫變小寫時
                    
                    name_1 = "Intron"+str(k)
                    Name.append(name_1)
                    start.append(j+1)
                    end.append(j-1+1)
                    k += 1

        end.append(len(gene_list[0]))

    else :
        number_Exon = become_upper + 1
        number_Intron = number_Exon -1
        i = 1
        k = 1
        for j in range(len(gene_list[0])):
            if j == 0:
                continue

            if j ==1:
                name_1 = "Exon"+str(j)
                Name.append(name_1)
                start.append(1)
                i += 1
                continue

            if (ord(gene_list[0][j])>=65  and ord(gene_list[0][j]) <=90) and (ord(gene_list[0][j-1])>=97  and ord(gene_list[0][j-1]) <=122) and (i <= number_Exon):
                    
                name_1 = "Exon"+str(i)
                Name.append(name_1)
                start.append(j+1)
                end.append(j-1+1)
                i += 1


            if (ord(gene_list[0][j-1])>=65  and ord(gene_list[0][j-1]) <=90) and (ord(gene_list[0][j])>=97  and ord(gene_list[0][j]) <=122) and (k <=  number_Intron):

                name_1 = "Intron"+str(k)
                Name.append(name_1)
                start.append(j+1)
                end.append(j-1+1)
                k += 1

        end.append(len(gene_list[0]))

    dict = {
        "Name":Name,
        "Start":start,
        "End":end,
    }
    df = pd.DataFrame(dict)
    df["Length"] = df["End"] - df["Start"] +1 
    df_2 = df.drop(index=1).reset_index(drop=True)
    
    if UTR3_length == 0:
        df_2 = df_2.drop(index=1)
    if UTR5_length == 0:
        df_2 = df_2.drop(index=0)

    df_2.to_csv("/home/cosbi/project1/data/hw2.csv", index = None)

    # 將 Intron 段刪除 並調整序列長短
    Intron_count = 1
    for i in range(len(Name)):
        if i == 0:
            continue
        
        if df["Name"][i] == "Intron" + str(Intron_count):
            df["Start"][i+1] = df["End"][i-1] + 1
            df["End"][i+1] = df["Start"][i+1] + df["Length"][i+1] -1
            df = df.drop(index = [i])
            Intron_count += 1

        if Intron_count > number_Intron:
            break

    df = df.reset_index(drop = True)

    if  df["Length"][2] != 0:
        df["End"][2] = df["End"][len(Name)-number_Intron-1]
        df["Start"][2] = df["End"][2] - df["Length"][2] + 1

    if df["Length"][0] != 0 and df["Length"][2] != 0:
        CDS_end = df["Start"][2] - 1
        CDS_start =df["End"][0] + 1
    if df["Length"][0] == 0:
        CDS_start = 1
    if df["Length"][2] == 0:
        CDS_end = df["End"][len(Name)-number_Intron-1]
    CDS_length = CDS_end - CDS_start +1

    df.loc[1] = ["CDS",CDS_start,CDS_end,CDS_length]

    if  UTR5_length == 0 :
        df  = df.drop(index = 0)
        
    if  UTR3_length == 0 :
        df  = df.drop(index = 2)

    df = df.reset_index(drop = True)

    print(df)

    df.to_csv("/home/cosbi/project1/data/hw3.csv", index = None)

def hw_4(request):
    def split_list(list,n):
        for idx in range(0, len(list), n):
            yield list[idx : idx+n]

    F = ["TTT", "TTC"]
    L = ["TTA", "TTG", "CTT", "CTC", "CTA", "CTG"]
    I = ["ATT", "ATC", "ATA"]
    M = ["ATG"]
    V = ["GTT", "GTC", "GTA", "GTG"]
    S = ["TCT", "TCC", "TCA", "TCG", "AGT", "AGC"]
    P = ["CCT", "CCC", "CCA", "CCG"]
    T = ["ACT", "ACC", "ACA", "ACG"]
    A = ["GCT", "GCC", "GCA", "GCG"]
    Y = ["TAT", "TAC"]
    H = ["CAT", "CAC"]
    Q = ["CAA", "CAG"]
    N = ["AAT", "AAC"]
    K = ["AAA", "AAG"]
    D = ["GAT", "GAC"]
    E = ["GAA", "GAG"]
    C = ["TGT", "TGC"]
    W = ["TGG"]
    R = ["CGT", "CGC", "CGA", "CGG", "AGA", "AGG"]
    G = ["GGT", "GGC", "GGA","GGG"]
    STOP = ["TAA", "TAG", "TGA"]

    query = request.POST['content']
    f = open('/home/cosbi/Downloads/unspliced+UTRTranscriptSequence_{}.fasta'.format(query),'r')
    lines=f.readlines()
    f.close()
    
    gene_list = []
    gene_list.append(lines[1])

    for element in gene_list[0][:]:
        if ord(element)>=97  and ord(element) <=122 :
            gene_list[0] = gene_list[0].replace(element,"")

    # gene_list1 = re.findall(r'\w{3}' , gene_list[0])
    gene_list[0] = list(split_list(gene_list[0],3))

    final_list = []

    # for element in gene_list1:
    for element in gene_list[0]:
        if element in F:
            final_list.append("F")
            continue
        if element in L:
            final_list.append("L")
            continue
        if element in I:
            final_list.append("I")
            continue
        if element in M:
            final_list.append("M")
            continue
        if element in V:
            final_list.append("V")
            continue
        if element in S:
            final_list.append("S")
            continue
        if element in P:
            final_list.append("P")
            continue
        if element in T:
            final_list.append("T")
            continue
        if element in A:
            final_list.append("A")
            continue
        if element in Y:
            final_list.append("Y")
            continue
        if element in H:
            final_list.append("H")
            continue
        if element in Q:
            final_list.append("Q")
            continue
        if element in N:
            final_list.append("N")
            continue
        if element in K:
            final_list.append("K")
            continue
        if element in D:
            final_list.append("D")
            continue
        if element in E:
            final_list.append("E")
            continue
        if element in C:
            final_list.append("C")
            continue
        if element in R:
            final_list.append("R")
            continue
        if element in G:
            final_list.append("G")
            continue    
        if element in W:
            final_list.append("W")
            continue  
        if element in STOP:
            break

    with open('/home/cosbi/project1/data/hw4.txt', 'w') as f:
        i =0
        for element in final_list:
            f.write(element)

def transcript_graph(request):
    df2 = pd.read_csv('data/hw2.csv')
    df3 = pd.read_csv('data/hw3.csv')
    df4 = pd.read_csv('data/hw4.txt',header=None)
    for i in range(len(df2["Name"])):
        if df2["Name"][i][len(df2["Name"][i])-3 : len(df2["Name"][i])] == "UTR":
            print(str(df2["Start"][i]) + ", " + str(df2["End"][i]))

    return render(request, 'project.html', locals())

def d3_graph(request):
    df2 = pd.read_csv('data/hw2.csv')
    df3 = pd.read_csv('data/hw3.csv')
    name1 = df2["Name"].values.tolist()
    name2 = df3["Name"].values.tolist()
    start1 = df2["Start"].values.tolist()
    start2 = df3["Start"].values.tolist()
    end1 = df2["End"].values.tolist()
    end2 = df3["End"].values.tolist()
    len1 = df2["Length"].values.tolist()
    len2 = df3["Length"].values.tolist()

    return JsonResponse({0: name1, 1: name2, 2:start1, 3:start2,
                         4:end1, 5:end2, 6:len1, 7:len2 })

def gene_strcture_graph(request):
    df2 = pd.read_csv('data/hw2.csv')
    df3 = pd.read_csv('data/hw3.csv')

    df2_UTR = df2
    df2_Exon = df2
    df2_Intron = df2
 
    for i in range(len(df2["Name"])):
        if df2_UTR["Name"][i][len(df2_UTR["Name"][i])-3 : len(df2_UTR["Name"][i])] == "UTR":
            continue
        else:
            df2_UTR = df2_UTR.drop(index = i)
    
    for i in range(len(df2["Name"])):
        if df2_Exon["Name"][i][0 : 4] == "Exon":
            continue
        else:
            df2_Exon = df2_Exon.drop(index = i)

    for i in range(len(df2["Name"])):
        if df2_Intron["Name"][i][0 : 6] == "Intron":
            continue
        else:
            df2_Intron = df2_Intron.drop(index = i)

    df2_UTR = df2_UTR.values.tolist()
    df2_Exon = df2_Exon.values.tolist()
    df2_Intron = df2_Intron.values.tolist()

    df3_UTR = df3
    df3_Exon = df3
    df3_CDS = df3

    for i in range(len(df3["Name"])):
        if df3_UTR["Name"][i][len(df3_UTR["Name"][i])-3 : len(df3_UTR["Name"][i])] == "UTR":
            continue
        else:
            df3_UTR = df3_UTR.drop(index = i)
    
    for i in range(len(df3["Name"])):
        if df3_Exon["Name"][i][0 : 4] == "Exon":
            continue
        else:
            df3_Exon = df3_Exon.drop(index = i)
    
    for i in range(len(df3["Name"])):
        if df3_CDS["Name"][i][0: 3] == "CDS":
            continue
        else:
            df3_CDS = df3_CDS.drop(index = i)        

    df3_UTR = df3_UTR.values.tolist()
    df3_Exon = df3_Exon.values.tolist()
    df3_CDS = df3_CDS.values.tolist()

    return JsonResponse({0: df2_UTR, 1: df2_Exon, 2: df2_Intron,
     3: df3_UTR, 4: df3_Exon, 5: df3_CDS })
    # return JsonResponse(response,{0: df2_UTR})

###############################################################################################
def crawler_gene(request):
    query = str(request.POST['content'])
    # query = "WBGene00000006"
    # query = "WBGene00006962"
    # query = "WBGene00002285" #會有問題,因其表格有兩種形式
    # 靜態爬蟲抓取transcript清單
    
    
    if query[0:3] == "WBG":
        # 靜態爬蟲抓取transcript清單
        resp = requests.get(
            "https://wormbase.org/rest/widget/gene/{}/sequences".format(query),
            headers={
                "User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
            })
        soup = BeautifulSoup(resp.text, "html.parser")
        # data = soup.find_all('a',{'class':'transcript-link'})
    else:
        chrome_options = webdriver.ChromeOptions()
        # 增加使用者電腦瀏覽器資訊 
        chrome_options.add_argument("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36")
        # 避免彈出視窗影響爬蟲表現
        chrome_options.add_argument("--disable-notifications")
        # 使瀏覽器不出現
        chrome_options.add_argument("--headless")
        path = "/home/cosbi/Documents/Web Crawler/chromedriver"
        browser = webdriver.Chrome( path, options=chrome_options)

        browser.get('https://wormbase.org/species/c_elegans/gene/{}'.format(query))
        time.sleep(1)
        query = str(browser.find_element(By.XPATH, '//*[@id="overview-content"]/div[2]/div[1]/div/div[15]/div[2]').text)
        
        resp = requests.get(
            "https://wormbase.org/rest/widget/gene/{}/sequences".format(query),
            headers={
                "User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
            })
        
        soup = BeautifulSoup(resp.text, "html.parser")

    data = json.loads(str(soup))
    data = data["fields"]["gene_models"]['data']["table"]
    data_type = []
    data_transname = []
    data_Tlen = []
    data_CDS = []
    data_Clen = []
    data_Protein = []
    data_PLen = []
    for i in range(len(data)):
        data_type.append(str(data[i]['type']))
    # 若為"non coding transcript"不進行胺基酸序列分析 
    # 若為"['Coding transcript']"則須進行胺基酸序列分析
    for i in range(len(data)):
        if data_type[i] == "['Coding transcript']":
            data_transname.append(data[i]['model'][0]["id"])
        else:
            data_transname.append(data[i]['model']["id"])
    
    # 處理cds資料
    for i in range(len(data)):
        if str(data[i]['cds']) == '(no CDS)':
            data_CDS.append(str(data[i]['cds']))
        else:
            data_CDS.append(str(data[i]['cds']['text']['label']))
    # 處理transcript 長度資料
    for i in range(len(data)):
        if data_type[i] == "['Coding transcript']":
            data_Tlen.append(data[i]["length_unspliced"][0])
        else:
            data_Tlen.append(data[i]["length_unspliced"])
    # 處理cds長度資料
    for i in range(len(data)):
        data_Clen.append(str(data[i]["length_spliced"]))
    # 處理protein資料
    for i in range(len(data)):
        if data_type[i] == "['Coding transcript']":
            data_Protein.append(data[i]["protein"]["label"])
        else:
            data_Protein.append("-")
    # 處理protein 長度資料
    for i in range(len(data)):
        if data_type[i] == "['Coding transcript']":
            data_PLen.append(data[i]["length_protein"])
        else:
            data_PLen.append("-")

    return JsonResponse({0: data_transname, 1: data_type, 2:data_Tlen, 3:data_CDS, 4:data_Clen, 5:data_Protein, 6:data_PLen,7: query})


def crawler_and_processing(request):
    # query = str(request.POST['content'])
    
    query = str(request.POST['name'])
    query2 = str(request.POST['type'])
    
    # print(query)
    def split_list(list,n):
        for idx in range(0, len(list), n):
            yield list[idx : idx+n]

    F = ["TTT", "TTC"]
    L = ["TTA", "TTG", "CTT", "CTC", "CTA", "CTG"]
    I = ["ATT", "ATC", "ATA"]
    M = ["ATG"]
    V = ["GTT", "GTC", "GTA", "GTG"]
    S = ["TCT", "TCC", "TCA", "TCG", "AGT", "AGC"]
    P = ["CCT", "CCC", "CCA", "CCG"]
    T = ["ACT", "ACC", "ACA", "ACG"]
    A = ["GCT", "GCC", "GCA", "GCG"]
    Y = ["TAT", "TAC"]
    H = ["CAT", "CAC"]
    Q = ["CAA", "CAG"]
    N = ["AAT", "AAC"]
    K = ["AAA", "AAG"]
    D = ["GAT", "GAC"]
    E = ["GAA", "GAG"]
    C = ["TGT", "TGC"]
    W = ["TGG"]
    R = ["CGT", "CGC", "CGA", "CGG", "AGA", "AGG"]
    G = ["GGT", "GGC", "GGA","GGG"]
    STOP = ["TAA", "TAG", "TGA"]

    # query = 'Y40B10A.2a.1'
    # query = 'F54H12.1c.3'
    # query = 'Y40B10A.2b.1'

    #動態進入wormbase網站

    chrome_options = webdriver.ChromeOptions()
    # 增加使用者電腦瀏覽器資訊 
    chrome_options.add_argument("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36")
    # 避免彈出視窗影響爬蟲表現
    chrome_options.add_argument("--disable-notifications")
    # 使瀏覽器不出現
    chrome_options.add_argument("--headless")
    
    path = "/home/cosbi/Documents/Web Crawler/chromedriver"
    browser = webdriver.Chrome( path, options=chrome_options)
    browser.get('https://wormbase.org/species/c_elegans/transcript/{}'.format(query))
    time.sleep(0.5)
    
    # 在不顯示瀏覽器時點擊此按鈕會造成錯誤
    # browser.find_element(By.LINK_TEXT, query).click()
    # time.sleep(1.5)

    # By.XPATH有時候不能使用
    button = browser.find_element(By.XPATH, "/html/body/div[2]/div[5]/div[3]/div[2]/div[1]/li[12]/div/div[2]/div[2]/div[1]/div[2]/div/div/div[2]/div[1]/button[1]")
    browser.execute_script("arguments[0].click();", button)
    time.sleep(0.5)


    # 靜態抓取序列色碼
    
    # 讀取網頁資料解析
    soup = BeautifulSoup(browser.page_source, "html.parser")
    browser.quit()

    # 抓取包含undefined jss.的class
    data = soup.find_all('span',{'class':re.compile('undefined jss.')})

    # 整理utr exon intron
    seq = []
    type1 = []
    type2 = []
    for transcript in data:
        seq.append(transcript.getText())
        if len(transcript["class"]) > 2:
            if transcript["class"][1] == 'jss93' :
                type1.append("5'UTR")
                type2.append("UTR")
            else:
                type1.append("3'UTR")
                type2.append("UTR")
        
        elif transcript["class"][1] == 'jss95':
            type1.append("Intron")
            type2.append("-")
        elif transcript["class"][1] == 'jss93':
            type1.append("Exon_yellow")
            type2.append("CDS")
        elif transcript["class"][1] == 'jss94':
            type1.append("Exon_orange")
            type2.append("CDS")

    Name = []
    Start = []
    End = []    

    Exon_times = 1
    Intr_times = 1
    name = ""
    UTR5start = 0

    def Classification(i):
        nonlocal Exon_times
        nonlocal Intr_times
        nonlocal name
        nonlocal UTR5start
        if type1[i][0:4] == "Exon":
            name = "Exon" + str( Exon_times)
            Exon_times += 1
        elif type1[i] == "Intron":
            name = "Intron" + str( Intr_times)
            Intr_times += 1
        else:
            # 測UTR在序列的前半還是後半
            if i/len(seq) > 0.5:
                name = "3'UTR"
            else:
                name = "5'UTR"
            
            if name == "5'UTR":
                UTR5start = i

    for i in range(len(seq)) :
        if i == 0:
            Classification(i)
            Name.append(name)
            Start.append(i+1)
            continue

        if type1[i] != type1[i-1]:
            if type1[i][0:4] != "Exon" and type1[i-1] == "5'UTR":
                name = "Exon" + str( Exon_times)
                Start.append(UTR5start)
                Name.append(name)
                End.append(i)
                Exon_times += 1
            Classification(i)
            Name.append(name)
            Start.append(i+1)
            End.append(i)
                
        if i == len(seq)-1 :
            End.append(len(seq))

    for i in range(len(Name)):
        if i == 0: 
            continue
        if Name[i][0:4] == "Exon" and (Name[i-1] == "5'UTR" or Name[i-1] == "3'UTR" ):
            Start[i] = Start[i-1]
        if i == len(Name)-1:
            break
        elif Name[i][0:4] == "Exon" and Name[i+1] == "3'UTR" :
            End[i] = End[i+1]

    unspliced = pd.DataFrame()
    unspliced["seq"] = seq
    unspliced["type1"] = type1
    unspliced["type2"] = type2
    unspliced.to_csv("unspliced.csv")

    hw2 = pd.DataFrame()
    hw2["Name"] = Name
    hw2["Start"] = Start
    hw2["End"] = End
    hw2["Length"] = hw2["End"] - hw2["Start"] +1
    print(hw2)
    hw2.to_csv("/home/cosbi/project1/data/hw2.csv", index = None)

    hw3 = pd.DataFrame()

    hw3 = hw2.drop(hw2[hw2["Name"].str.contains('Intron')].index).reset_index(drop = True)
    # print(hw3)

    for i in range(len(hw3["Name"])):
        if i == 0:
            continue
        if hw3["Name"][i-1] == "5'UTR":
            hw3["Start"][i] = hw3["Start"][i-1]
            hw3["End"][i] = hw3["Start"][i] + hw3["Length"][i] -1
        # 假設遇到多段3'UTR時使其算法與Εxon相同
        elif hw3["Name"][i] == "3'UTR" and hw3["Name"][i-1] != "3'UTR":
            pass
        else:
            hw3["Start"][i] = hw3["End"][i-1] +1
            hw3["End"][i] = hw3["Start"][i] + hw3["Length"][i] - 1
        # 針對後方有3'UTR的來做出計算
        if i < len(hw3["Name"])-1:
            if hw3["Name"][i+1] == "3'UTR" and hw3["Name"][i] != "3'UTR":
                hw3["End"][i+1] = hw3["End"][i]
                hw3["Start"][i+1] = hw3["End"][i+1] - hw3["Length"][i+1] +1

    for i in range(len(hw3)):
        for j in range(i+1,len(hw3)):
            if hw3["Name"][i] == hw3["Name"][j]:
                print(hw3["Name"][i])
                hw3["Start"][i] = min(hw3["Start"][i],hw3["Start"][j])
                hw3["End"][i] = max(hw3["End"][i],hw3["End"][j])
                hw3["Length"][i] = hw3["End"][i] - hw3["Start"][i] +1
                hw3["Name"][j] = "delete"
    hw3 = hw3.drop(hw3[hw3["Name"] == "delete"].index).reset_index(drop = True)

    # CDS 資料處理
    CDS_name = "CDS"
    CDS_start = 1
    CDS_end = 0
    CDS_length = 0
    if "3'UTR" in hw3["Name"].values :
        idx = hw3.index[hw3["Name"] == "3'UTR"].tolist()
        CDS_end = hw3["Start"][idx[0]] -1 
    else:
        CDS_end = hw3["End"][len(hw3["End"]) - 1]

    if "5'UTR" in hw3["Name"].values :
        idx = hw3.index[hw3["Name"] == "5'UTR"].tolist()
        CDS_start = hw3["End"][idx[0]] +1
    else:
        CDS_start = 1

    CDS_length = CDS_end - CDS_start + 1 
    CDS = {
        'Name': CDS_name,
        "Start": CDS_start,
        "End" : CDS_end,
        'Length': CDS_length
    }
    hw3 = hw3.append(CDS,ignore_index=True)

    # print(hw3)
    hw3.to_csv("/home/cosbi/project1/data/hw3.csv", index = None)

    spliced = unspliced.drop( unspliced[unspliced["type1"] == "Intron"].index )
    spliced.to_csv("spliced.csv")
    seq2 = list(spliced["seq"])
    seq_color2 = list(spliced["type1"])

    if query2 == "['Coding transcript']":
        amino_acid = []
        amino_acid.append("".join(seq))
        # print(amino_acid)
        for element in amino_acid[0]:
            if ord(element)>=97  and  ord(element) <=122:
                amino_acid[0] = amino_acid[0].replace(element,"")
        amino_acid = list(split_list(amino_acid[0],3)) #要在字串型態上才能使用
        # print(amino_acid)
        amino_acid_final_list = []
        
        for element in amino_acid:
                if element in F:
                    amino_acid_final_list.append("F")
                    continue
                if element in L:
                    amino_acid_final_list.append("L")
                    continue
                if element in I:
                    amino_acid_final_list.append("I")
                    continue
                if element in M:
                    amino_acid_final_list.append("M")
                    continue
                if element in V:
                    amino_acid_final_list.append("V")
                    continue
                if element in S:
                    amino_acid_final_list.append("S")
                    continue
                if element in P:
                    amino_acid_final_list.append("P")
                    continue
                if element in T:
                    amino_acid_final_list.append("T")
                    continue
                if element in A:
                    amino_acid_final_list.append("A")
                    continue
                if element in Y:
                    amino_acid_final_list.append("Y")
                    continue
                if element in H:
                    amino_acid_final_list.append("H")
                    continue
                if element in Q:
                    amino_acid_final_list.append("Q")
                    continue
                if element in N:
                    amino_acid_final_list.append("N")
                    continue
                if element in K:
                    amino_acid_final_list.append("K")
                    continue
                if element in D:
                    amino_acid_final_list.append("D")
                    continue
                if element in E:
                    amino_acid_final_list.append("E")
                    continue
                if element in C:
                    amino_acid_final_list.append("C")
                    continue
                if element in R:
                    amino_acid_final_list.append("R")
                    continue
                if element in G:
                    amino_acid_final_list.append("G")
                    continue    
                if element in W:
                    amino_acid_final_list.append("W")
                    continue  
                if element in STOP:
                    break
        with open('/home/cosbi/project1/data/hw4.txt', 'w') as f:
            i =0
            for element in amino_acid_final_list:
                f.write(element)

    return JsonResponse({0:seq ,1:type1 ,2:seq2, 3:seq_color2})

def show_data(request):
    
    # query = request.POST['content']
    query = str(request.POST['name'])
    query2 = str(request.POST['type'])
    # 刪除爬蟲下來取得的資料
    # os.remove('/home/cosbi/Downloads/unspliced+UTRTranscriptSequence_{}.fasta'.format(query))

    df2 = pd.read_csv('data/hw2.csv')
    df3 = pd.read_csv('data/hw3.csv')
    

    # df2 = pd.read_csv("data/unspliced.csv")
    # df3 = pd.read_csv("data/spliced.csv")

    for i in range(len(df2["Name"])):
        if df2["Name"][i][len(df2["Name"][i])-3 : len(df2["Name"][i])] == "UTR":
            print(str(df2["Start"][i]) + ", " + str(df2["End"][i]))
    # print(df2["Name"][0][len(df2["Name"][0])-3 : len(df2["Name"][0])])

    body = df2.values.tolist()

    body2 = df3.values.tolist()

    # print(body)
    # print(len(df4[0][0]))
    if query2 == "['Coding transcript']":
        df4 = pd.read_csv('data/hw4.txt',header=None)
        body3 = df4.values.tolist()
        body3 = list(body3[0])
    else:
        body3 = []

    # j = 0
    # for i in range(len(df4[0][0])):

    #     if i % 10 == 0:
    #         if i ==0:
    #             num = 1+20*j
    #             body3.append([str(num)])
    #             continue
    #         print(df4[0][0][i-10:i])
    #         body3[j].append(df4[0][0][i-10:i])

    #     if i % 20 == 0:
    #         num = 1+20*(j+1)
    #         body3.append([str(num)])
    #         j += 1
        
    #     if i == len(df4[0][0])-1 :
    #         print(df4[0][0][i- i%10 :i+1])
    #         body3[j].append(df4[0][0][i-i%10:i+1])
    #         while True:
    #             if len(body3[j]) < 3:
    #                 body3[j].append("-")
    #             else :
    #                 break

    # for i in range(len(df['Length'])):
    #     dict_data = {
    #         'Name' : df["Name"][i],
    #         'Start':str(df['Start'][i]),
    #         'End': str(df['End'][i]),
    #         'Length': str(df['Length'][i])
    #     }
    #     json_object = json.dumps(dict_data, indent = 4)
    #     response.append(json_object)

    # json_object = json.dumps(response, indent = 4) 
    # json.dumps(response, indent = 4)
    
    # '/home/cosbi/Downloads/unspliced+UTRTranscriptSequence_{}.fasta'.format(query)
    
    # 將處理完資料刪除
    # os.remove('data/hw2.csv')
    # os.remove('data/hw3.csv')
    # os.remove('data/hw4.txt')
    
    return JsonResponse({0:body ,1:body2, 2:body3})

    # return render(request, 'project.html', response) 
    # return JsonResponse(response)

def ajax_data(request):
    
    gene_id = request.POST['content']
    # gene_id = request.POST['gene_id']
    
    try:
        gene = models.Gene.objects.get(gene_id=gene_id)
        transcript = gene.transcript_id
        numbers = gene.numbers
        # message = 'Transcript ID: ' + transcript + ' Numbers: ' + str(numbers)
        message = 'Transcript ID: ' + transcript
        message2 = ' Numbers: ' + str(numbers)
        
    except:
        message = 'Something wrong, please check again.'
    
    response = {
        'message': message,
        'message2': message2
    }
    return JsonResponse(response)

def piTarPrediction(request):
    query = str(request.POST['content'])
    def strtr(text, dic):
        regex = re.compile("(%s)" % "|".join(map(re.escape, dic.keys())))
        # For each match, look-up corresponding value in dictionary
        return regex.sub(lambda mo: str(dic[mo.string[mo.start():mo.end()]]), text)

    def complement(seq):
        replacements = {
        "A" : "U",
        "U" : "A",
        "G" : 'C',
        "C" : 'G'
        }
        out = strtr(seq,replacements)
        return out

    def scan(q,num,Arr2,options):
        global piRNA_Length
        # 讀取piRNA序列
        with open('piRNA/{0}/piRNA{1}.txt'.format(options['nematodeType'],num+1),'r') as f1:
            reader1 = csv.reader(f1)
            ArrPiRNA = []
            piRNA_information = []
            for x in reader1:
                ArrPiRNA.append([x[0],x[1].strip()])
                piRNA_Length = len(x[1])
                x.pop(0)
                x.pop(0)
                ArrPiRNA[len(ArrPiRNA)-1].append(x)

        #開始逐個site進行掃描比對
        outArr = []
        for key in ArrPiRNA:
            print(key)
            Arr1 = list(complement(key[1][::-1]))   #piRNA做reverse compliment然後將字符切成21個陣列
            for a in range(len(Arr2)-len(Arr1)+1): # a=輸入序列掃描次序 a次數不會大於(總長-piRNA長)，用range所以+1
                GG = 1 
                Arr4 = []	#Arr4存沒對到的位置
                ArryxGU = []  #ArryxGU存non-GU的錯誤位置
                Arr3 = list(key[1][::-1])
                Arr5 = list(key[1][::-1])  #Arr5存piRNA的Reverse秀結果用 



                """每個site從piRNA位置2開始往左確認每一個位置是否對到 
                    d計算#seed_non_GU m計算#seed_GU e計算#non_seed_non_GU  n計算#non_seed_GU 
                    o儲存piRNA位置1的配對情形"""

                b = a +len(Arr1)-2
                c = len(Arr1)-2
                d = 0
                e = 0
                m = 0
                n = 0
                o = 0
                while(b>=a):				
                    if c >= len(Arr1)-7 and Arr2[b] != Arr1[c]:
                        # seed區沒對到
                        if (Arr2[b]=='G' and Arr1[c]=='A') or (Arr2[b]=='U' and Arr1[c]=='C'):
                            #沒對到的是GU    
                            if m == int(options['core_GU']):
                                b-=1
                                c-=1
                                break
                            Arr3[c] = Arr2[b]
                            Arr5[c] = "<mark id='b'>"+Arr5[c]+"</mark>"
                            Arr4.append("<mark id='b'>"+str(len(Arr1)-c)+"</mark>")
                            m+=1
                        else:
                            #沒對到的不是GU
                            if d == int(options['core_non_GU']):
                                b-=1
                                c-=1
                                break
                            Arr3[c] = Arr2[b]
                            Arr5[c] = "<mark>"+Arr5[c]+"</mark>"
                            ArryxGU.append(str(len(Arr1)-c))
                            Arr4.append("<mark>"+str(len(Arr1)-c)+"</mark>")
                            d+=1
                        b-=1
                        c-=1


                    elif Arr2[b] == Arr1[c] and b != a :
                        # 對到的情況
                        Arr3[c] = Arr2[b]
                        b-=1
                        c-=1

                    elif d + e + m + n > int(options['total']) or (options['pts'][0] == 'true' and 10-d*scoreA-m*scoreB-e*scoreC-n*scoreD < options['pts'][1]):
                        #錯誤總數大於total
                        b-=1
                        c-=1
                        break


                    elif c<len(Arr1)-7 and Arr2[b] != Arr1[c] and b != a:
                        # non_seed區沒對到的情況
                        if (Arr2[b]=='G' and Arr1[c]=='A') or (Arr2[b]=='U' and Arr1[c]=='C'):
                            #沒對到的是GU    
                            if n == int(options['non_core_GU']):
                                b-=1
                                c-=1
                                break
                            Arr3[c] = Arr2[b]
                            Arr5[c] = "<mark id='b'>"+Arr5[c]+"</mark>"
                            Arr4.append("<mark id='b'>"+str(len(Arr1)-c)+"</mark>")
                            n+=1
                        else:
                            #沒對到的不是GU
                            if e == int(options['non_core_non_GU']):
                                b-=1
                                c-=1
                                break
                            Arr3[c] = Arr2[b]
                            Arr5[c] = "<mark>"+Arr5[c]+"</mark>"
                            ArryxGU.append(str(len(Arr1)-c))
                            Arr4.append("<mark>"+str(len(Arr1)-c)+"</mark>")
                            e+=1
                        b-=1
                        c-=1


                    elif b == a:
                        # 掃到該site最左邊位置的情況

                        if Arr2[b] != Arr1[c]:
                            if (Arr2[b]=='G' and Arr1[c]=='A') or (Arr2[b]=='U' and Arr1[c]=='C'):
                                #沒對到的是GU    
                                if n == int(options['non_core_GU']):
                                    b-=1
                                    c-=1
                                    break
                                Arr3[c] = Arr2[b]
                                Arr5[c] = "<mark id='b'>"+Arr5[c]+"</mark>"
                                Arr4.append("<mark id='b'>"+str(len(Arr1)-c)+"</mark>")
                                n+=1
                            else:
                                #沒對到的不是GU
                                if e == int(options['non_core_non_GU']):
                                    b-=1
                                    c-=1
                                    break
                                Arr3[c] = Arr2[b]
                                Arr5[c] = "<mark>"+Arr5[c]+"</mark>"
                                ArryxGU.append(str(len(Arr1)-c))
                                Arr4.append("<mark>"+str(len(Arr1)-c)+"</mark>")
                                e+=1
                        elif Arr2[b] == Arr1[c] :
                            Arr3[c] = Arr2[b]
                        Arr3[len(Arr1)-1] = Arr2[a+len(Arr1)-1]
                        if Arr2[a+len(Arr1)-1] != Arr1[len(Arr1)-1] :
                            if (Arr2[a+len(Arr1)-1]=='G' and Arr1[len(Arr1)-1]=='A') or (Arr2[a+len(Arr1)-1]=='U' and Arr1[len(Arr1)-1]=='C'):
                                #沒對到的是GU    
                                Arr5[len(Arr1)-1] = "<mark id='g'>"+Arr5[len(Arr1)-1]+"</mark>"
                                Arr4.insert(0,"<mark id='g'>1</mark>")
                            else:
                                #沒對到的不是GU
                                Arr5[len(Arr1)-1] = "<mark id='g'>"+Arr5[len(Arr1)-1]+"</mark>"
                                Arr4.insert(0,"<mark id='g'>1</mark>")
                                ArryxGU.insert(0,'1')
                            o+=1
                        if d + e + m + n > int(options['total']) or (options['pts'][0] == 'true' and 10-d*scoreA-m*scoreB-e*scoreC-n*scoreD < options['pts'][1]):
                            b-=1
                            c-=1
                            break
                        Arr3[len(Arr1)-2] = Arr3[len(Arr1)-2]+"<span id='L'>|</span>"
                        Arr5[len(Arr1)-2] = Arr5[len(Arr1)-2]+"<span id='L'>|</span>"
                        Arr3[len(Arr1)-8] = Arr3[len(Arr1)-8]+"<span id='L'>|</span>"
                        Arr5[len(Arr1)-8] = Arr5[len(Arr1)-8]+"<span id='L'>|</span>"
                        if Arr4 == [] :
                            Arr4 = 'N/A'
                        if ArryxGU == [] :
                            ArryxGU = 'N/A'
                                    
                        outArr.append([key[0],str(a+1)+'-'+str(a+21),o+d+e+m+n,','.join(Arr4),','.join(ArryxGU),d,m,e,n,"<span style=\"white-space:nowrap\">5' "+''.join(Arr3)+" 3'","3' "+''.join(Arr5)+" 5'</span>",key[2],key[1][::-1],str(a+1).zfill(5),10-d*scoreA-m*scoreB-e*scoreC-n*scoreD])
                        GG+=1
                        b-=1
                        c-=1
        if outArr==[]:
            outArr = 'N/A'
        q.put(outArr)

    parser = argparse.ArgumentParser()
    with open(sys.argv[1],'r') as inSeq:
        inputSeqName = inSeq.readline().strip().replace('>','')
        inputSeq = inSeq.readline().strip().upper().replace('T','U')

    nematodeType = sys.argv[2]
    if nematodeType == 'cb':
        nematodeType = 'C.briggsae'
    elif nematodeType == 'ce':
        nematodeType = 'C.elegans'
    else:
        sys.exit('nematode Type error!')

    CDS = sys.argv[3]
    if CDS == 'whole':
        CDS_A = '-555'
        CDS_B = '-555'
    elif CDS == 'none':
        CDS_A = 0
        CDS_B = 0
    else:
        CCC = CDS.split('-')
        CDS_A = int(CCC[0])
        CDS_B = int(CCC[1])

    rulesList = ast.literal_eval(sys.argv[4])
    if len(rulesList) == 6:
        pts_switch = 'true'
        ptsss = rulesList[5]
    else:
        pts_switch = 'false'
        ptsss = 0

    global scoreA,scoreB,scoreC,scoreD
    scoreA = 7
    scoreB = 1.5
    scoreC = 2
    scoreD = 1.5


    # 各種防呆
    if inputSeq == '':
        print('noSeq')
        sys.exit('nematode Type error!')
    else:
        if inputSeqName == '':
            sys.exit('noSeqName')

        name = inputSeqName
        RNA = inputSeq
        if re.search("^[AUCG]+$",RNA) == None:
            sys.exit('input Seq is weird')


        Arr2 = list(RNA)
        options = {'core_non_GU':rulesList[0],'core_GU':rulesList[1],'non_core_non_GU':rulesList[2],'non_core_GU':rulesList[3],'total':rulesList[4],'nematodeType':nematodeType,'pts':[pts_switch,ptsss]}
        with open('piRNA/{0}/info_name.csv'.format(options['nematodeType']),'r') as f2:
            reader2 = csv.reader(f2)
            info_names = []
            for x in reader2:
                info_names.append(x[0])

        ############ CDS防呆
        if CDS_A == '-555':
            CDS1 = 1		
        elif CDS_A is '0' : 
            sys.exit('CDS error')
        elif CDS_A!='' :
            if float(CDS_A)%1 !=0 : 
                sys.exit('CDS error')
            else:
                CDS1 = int(CDS_A)				
        else: 
            CDS1 = 0

        if CDS_B == '-555':
            CDS2 = len(Arr2)
            CDS_region = 'Whole input sequence (1 - '+str(CDS2)+')'		
        elif CDS_B is '0' : 		
            sys.exit('CDS error')
        elif CDS_B!='' :
            if float(CDS_B)%1 !=0 :		
                sys.exit('CDS error')
            else:
                CDS2 = int(CDS_B)
                CDS_region = str(CDS1)+' - '+str(CDS2)
        else:
            CDS2 = 0
            CDS_region = 'None'

        if (CDS1==0 and CDS2!=0) or (CDS2==0 and CDS1!=0) or ((CDS1!= 0 and CDS2!= 0) and ((CDS1 >= CDS2) or ((CDS2-CDS1-2)%3 !=0) or (CDS2 > len(Arr2)) or (CDS1 < 1))):
            sys.exit('CDS error')
        #################################################################

        # 通過防呆才會進入下方主程序
        else:
            #各物種多工進程任務數量
            mission_count = {'C.elegans':357, 'C.briggsae':290, 'C.brenneri':1157, 'C.remanei':813}
            result=[]

            # 下多工命令
            q = JoinableQueue()
            for num in range(mission_count[options['nematodeType']]):
                Process(target=scan, args=(q, num ,Arr2 ,options)).start()

            # 各多工任務結果蒐集
            for t in range(mission_count[options['nematodeType']]):
                a = q.get()
                if a != 'N/A':
                    for x in a:
                        result.append(x)
                q.task_done()
            q.join()
            outForAdvice = result

            data = {
                'gene':RNA,
                'name':name,
                'newout':result,
                'options':options,
                'CDS1':CDS1,
                'CDS2':CDS2,
                'CDS_region':CDS_region,
                'Tscore':[scoreA,scoreB,scoreC,scoreD],
            }

            with open('output/piRNA_targeting_sites.json','w') as w1:
                json.dump(data,w1,indent=4)

            result = sorted(result, key = lambda l:(l[14],-int(l[1].split('-')[0])),reverse=True)

            with open('output/piRNA_targeting_sites.csv','w') as w1:
                wr1 = csv.writer(w1)
                wr1.writerow(['Sequence name: '+ name])
                wr1.writerow(['Specify coding sequence (CDS) region: '+ CDS_region])
                wr1.writerow(['piRNA targeting rules: '])
                wr1.writerow(['Seed region: non-GU: up to {0}, GU: up to {1}'.format(options['core_non_GU'],options['core_GU'])])
                wr1.writerow(['Non-seed region: nonGU: up to {0}, GU: up to {1}'.format(options['non_core_non_GU'],options['non_core_GU'])])
                wr1.writerow(['Total mismatches: up to {0}'.format(options['total'])])
                if options['pts'][0] == 'true':
                    wr1.writerow(['piRNA targeting score: more than or equal to {0}'.format(options['pts'][1])])
                wr1.writerow([''])
                wr1.writerow(['piRNA','piRNA targeting score','targeted region in input sequence','# mismatches','position in piRNA','# non-GU mismatches in seed region','# GU mismatches in seed region','# non-GU mismatches in non-seed region','# GU mismatches in non-seed region','5\' Input sequence 3\'','3\' piRNA 5\''])
                for td in result:				
                    piName = td[0]
                    detailTopStr = re.sub("<.*?>", "", td[9]).replace("5' ",'').replace(" 3'",'').replace("|",'')
                    detailBotStr = re.sub("<.*?>", "", td[10]).replace("3' ",'').replace(" 5'",'').replace("|",'')
                    detail = detailTopStr + '\n' + detailBotStr
                    wr1.writerow([piName,10-int(td[5])*scoreA-int(td[6])*scoreB-int(td[7])*scoreC-int(td[8])*scoreD,td[1],td[2],re.sub("<.*?>", "", td[3]),td[5],td[6],td[7],td[8],detailTopStr,detailBotStr])