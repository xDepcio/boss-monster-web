tar --exclude='*/node_modules' --exclude='*/.git' --exclude='*/build' -czvf archive_name.tar.gz *
scp archive_name.tar.gz adrwal@192.168.0.24:~/boss-monster-web

ssh adrwal@192.168.0.24 << 'ENDSSH'
cd ~/boss-monster-web
tar -xzvf archive_name.tar.gz
rm archive_name.tar.gz
ENDSSH

rm archive_name.tar.gz
