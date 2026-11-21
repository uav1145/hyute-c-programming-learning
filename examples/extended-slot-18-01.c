#include <stdio.h>
#include <string.h>
int main(void) {
    char line[] = "An, Binh,,Chi";
    char *token = strtok(line, ", ");
    int count = 0;
    while (token != NULL) {
        printf("%d:%s\n", ++count, token);
        token = strtok(NULL, ", ");
    }
    printf("Tong token=%d\n", count);
    return 0;
}
