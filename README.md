# arabic

repo for arabic related things.

# Change log

* Adding pl_ar_dict containing "LEMMA_SEARCH_FRQ_RANK" created as `=IFERROR(VLOOKUP(B2,frq_50k!A:B,2,FALSE), "NaN")` where frq_50k is a frequency list from `opensubtitle_2018_ar_50k.xlsx`
* Ading https://www.wordfrequency.info/ corpus
* Added another word frequency ranking based on the data from www.wordfrequency.info. 5k most common english words. NOt ideal, for example #4 work 'a' does not have a match, which is ok, but #10 word 'it' does not hae a patch eather, with is less ideal.
