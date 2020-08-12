#import libraries

import requests
import urllib.request
import time
from bs4 import BeautifulSoup

url = 'http://skyserver.sdss.org/dr16/en/tools/chart/list.aspx'

response = requests.get(url)

file = open('list.html')

file_text = file.read()

t0 = time.clock()
soup = BeautifulSoup(file_text, 'html.parser')

line_count = 1
for one_a_tag in soup.findAll('img'):
    if line_count >= 7:
        link = one_a_tag['src']
        print(link)
        urllib.request.urlretrieve(link, './' + str(line_count) + '.jpg')
    line_count += 1
t1 = time.clock() - t0
print(t1)
