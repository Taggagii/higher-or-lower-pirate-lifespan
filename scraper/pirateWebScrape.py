import requests
import json
import re
from bs4 import BeautifulSoup as bs

parentLink = 'https://en.wikipedia.org'
listRelateLink = '/wiki/List_of_pirates'

r = requests.get(parentLink + listRelateLink);
print(r)

soup = bs(r.content, 'html.parser')

# get list of pirates
pirates = []
pirateTables = soup.find_all('table', class_ = 'wikitable')

for pirateTable in pirateTables:
    # pirates.extend(pirateTable.find_all('tr')[1:]);
    addPirates = pirateTable.find_all('tr')[1:]
    pirates.extend(addPirates)

# returns -1 for unknown or ages above 100
def htmlPirateAge(s):
    text = s.text
    
    if (s.find('abbr') != None):
        return -1
    
    if (re.search("\.d", text) != None):
        return -1

    if (re.search("\.fl", text) != None):
        return -1
    
    birthDeath = re.findall("\d+", s.text)
    birthDeath = list(map(int, birthDeath))
    
    if (len(birthDeath) != 2):
        return -1

    age = abs(birthDeath[1] - birthDeath[0])
    return age

def htmlToPirate(s):
    pirateProperties = s.find_all('td')
    
    name = pirateProperties[0].text
    name = re.search("[^ \[\]]+( *[^ \[\]]+)*", name).group()
    name = re.sub(r'[^\x00-\xFF]', '', name)
    name = name.replace('\n', '')
    print(name)
    
    age = htmlPirateAge(pirateProperties[1])

    wikilink = ""
    
    if (not (s.find('b') == None or s.find('b').find('a') == None)):
        linkEnd = pirateProperties[0].find('a').get('href')
        if (linkEnd[0] == '/'):
            wikilink = parentLink + linkEnd
        else:
            wikilink = linkEnd

    piclink = ""

    if (wikilink != ""):
        piratePage = requests.get(wikilink)
        piratePageSrc = bs(piratePage.content, 'html.parser')
        infoBox = piratePageSrc.find(class_ = "infobox-image")
        
        if (infoBox != None):
            linkEnd = infoBox.find('img').get('src')
            if (re.search('^/[^/]+', linkEnd) != None):
                piclink = parentLink + linkEnd
            else:
                piclink = linkEnd
    
    pirate = {name:
                 {
                     'age':age,
                     'wiki-link':wikilink,
                     'pic-link':piclink
                 }
             }
    return pirate

def pirateValid(p):
    if (list(p.values())[0]['age'] == -1):
        return False
    if (list(p.values())[0]['wiki-link'] == ''):
        return False
    if (list(p.values())[0]['pic-link'] == ''):
        return False
    return True
# pirate is name : [birth death age era pic link] 

pirates = list(map(htmlToPirate, pirates))
pirates = filter(pirateValid, pirates)
pirateData = {}

for i in pirates:
    pirateData.update(i)

pirateData = {fixName(key):value for key, value in data.items()}

out = open('data.json', 'w')
json.dump(pirateData, out, indent = 4);
out.close()
