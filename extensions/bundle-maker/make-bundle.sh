#!/bin/sh

N=deckjsWithExtensions

if test -d .git
then
    rm -rf $N
    mkdir $N
    cp -t $N -r core/ extensions/ libs/ examples/ themes/ modernizr.custom.js jquery-1.7.min.js
    zip -r $N.zip $N
else
    echo "This script is designed to be run from the root of the git repository"
fi
