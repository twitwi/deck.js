#!/bin/sh

N=deckjs-bundle
W=$(basename $(dirname $(readlink -f $0)))

SCRATCH=/tmp
test -d /media/ramdisk && SCRATCH=/media/ramdisk

if test -d .git
then
    pwd=$(pwd)
    cd $SCRATCH
    tmp=,,for-$N
    rm -rf $tmp
    git clone $pwd $tmp
    tmp=$(pwd)/$tmp
    cd -
    rm -rf $N $N.zip
    mkdir -p $N/deck.js
    cp -t $N/deck.js -r $tmp/core/ $tmp/extensions/ $tmp/libs/ $tmp/samples/ $tmp/themes/ $tmp/modernizr.custom.js $tmp/jquery.min.js
    cp -t $N $tmp/extensions/$W/README.txt $tmp/extensions/$W/presentation.html $tmp/extensions/$W/presentation-includedeck.html
    cat $tmp/.git/refs/heads/master >> $N/README.txt
    zip -r $N.zip $N
else
    echo "This script is designed to be run from the root of the git repository"
fi
