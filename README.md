# SDSS-scraper
Contains code for the SDSS image scraper extension along with some other image scraping scripts
## downloads-links 
This is the main package for the extension. Both the JSZip and JSZipUtils libraries are also located there.
## scraper.py
This is a python script that has the same function as the extension. Uses BeautifulSoup 4 to extract image urls from html. Main flaw lies in the fact that the html has to be downloaded as a file before script can be run.
