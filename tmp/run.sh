docker run -it -v /tmp/.X11-unix:/tmp/.X11-unix   -e DISPLAY=unix$DISPLAY ellerbrock/alpine-firefox:latest "http://www.swarmlab.io"
