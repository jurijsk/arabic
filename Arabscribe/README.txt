This is the ARABSCRIBE dataset containing transcriptions of Arabic words with both Roman and Arabic keyboards.

They are done on 500 words randomly selected from the Arabic dictionary, 100 words in the test set, 400 in the training set.

The data format of the CSV files is

[Canonical Arabic Word],[User1_Id],[User1_Transcript],[User2_Id],[User2_Transcript],....etc

There is also the users.csv file that gives details on each user id as to their arabic level, native lagnuage, and which keyboard they used to do transcriptions.
The format of this file is:

[User Id],[Native Language],[Arabic level 0-5],[Keyboard language used]
