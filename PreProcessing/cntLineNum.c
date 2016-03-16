#include <stdio.h>
int main(int argc, const char *argv[])
{
    char dataPath[] = "/Users/Adward/OneDrive/YelpData/yelp_academic_dataset_review.json";
    FILE *fp;
    char strLine[65536];
    long rowN = 0;
    if ((fp = fopen(dataPath, "r")) == NULL) {
        printf("Error! No such file!\n");
        return -1;
    }
    while (!feof(fp)) {
        fgets(strLine, 60000, fp);
        //printf("%s\n", strLine);
        rowN ++;
    }
    fclose(fp);
    printf("%ld\n", rowN);
    return 0;
}
