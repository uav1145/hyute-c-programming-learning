#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <ctype.h>
#include <limits.h>
int main(void) {
    FILE *f = fopen("diem_v2.txt", "w");
    if (f == NULL) { perror("Mo ghi"); return 1; }
    int write_failed = (fputs("8\n9\n7\n", f) == EOF);
    if (fclose(f) != 0) write_failed = 1;
    if (write_failed) return 1;
    f = fopen("diem_v2.txt", "r");
    if (f == NULL) { perror("Mo doc"); return 1; }
    char line[64];
    long sum = 0;
    int count = 0, invalid = 0;
    while (fgets(line, sizeof line, f) != NULL) {
        char *end;
        errno = 0;
        long v = strtol(line, &end, 10);
        while (isspace((unsigned char)*end)) ++end;
        if (errno == ERANGE || end == line || *end != '\0' || v < 0 || v > 10) { invalid=1; break; }
        sum += v; ++count;
    }
    if (ferror(f)) invalid = 1;
    if (fclose(f) != 0 || invalid || count == 0) { puts("Tap tin loi"); return 1; }
    printf("So dong=%d; TB=%.2f\n", count, (double)sum/count);
    return 0;
}
