#include <stdio.h>
int main(void) {
    int a[] = {4, 3, 1, 2};
    int n = 4;
    for (int pass = 0; pass < n-1; ++pass) {
        int changed = 0;
        for (int j = 0; j < n-pass-1; ++j) {
            if (a[j] > a[j+1]) {
                int tmp=a[j]; a[j]=a[j+1]; a[j+1]=tmp;
                changed=1;
            }
        }
        if (!changed) break;
    }
    for (int i=0; i<n; ++i) printf("%d%c",a[i],i==n-1?'\n':' ');
    return 0;
}
