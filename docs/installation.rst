===========
APPLICATION
===========

Prérequis
=========

* Environnement serveur :

Voir le guide d'installation du serveur dans https://github.com/PnX-SI/TaxHub/blob/master/docs/serveur.rst

* Cet documentation présente la procédure avec un utilisateur linux nommé ``synthese``. Dans ce guide, le répertoire de cet utilisateur est dans ``/home/synthese``. Adapter les chemins selon votre serveur.

* Se loguer sur le serveur avec l'utilisateur ``synthese`` ou tout autre utilisateur linux faisant partie du groupe www-data.

* Récupérer le zip de l’application sur le Github du projet (`X.Y.Z à remplacer par le numéro de version souhaitée <https://github.com/PnX-SI/TaxHub/releases>`_), dézippez le dans le répertoire ``/home/synthese`` :

  ::  
  
        cd /home/synthese
        wget https://github.com/PnX-SI/TaxHub/archive/X.Y.Z.zip
        unzip X.Y.Z.zip
        mv TaxHub-X.Y.Z/ taxhub/


Configuration initiale
======================

* Version de Python

Pour trouver la version de python3 installé sur votre serveur et la noter dans ``settings.ini``

::

    apt-cache policy python3

Si Python 3 n'est pas installé :

::

    sudo apt-get install python3

* Créer et mettre à jour le fichier ``settings.ini``
 
  ::  
  
        cd taxhub
        cp settings.ini.sample settings.ini
        nano settings.ini

Renseigner les informations nécessaires à la connexion à la base de données PostgreSQL. Il est possible mais non conseillé de laisser les valeurs proposées par défaut. 

ATTENTION : Les valeurs renseignées dans ce fichier sont utilisées par le script d'installation de la base de données ``install_db.sh`` et ``install_app.sh`` . 
Les utilisateurs PostgreSQL doivent être en concordance avec ceux créés lors de la dernière étape de l'installation serveur ``Création de 2 utilisateurs PostgreSQL``. 

Configuration Apache
====================

* Voici une des manières de configurer apache via le fichier ``/etc/apache2/sites-available/default``. Vous pouvez aussi créer un virtualhost dédié à l'application.

Editer le fichier :

::

    sudo nano /etc/apache2/sites-available/default

* Apache 2.4 et supérieur : Avant la dernière ligne ``</VirtualHost>``, copier-coller le texte ci-dessous en adaptant les chemins à votre installation.
 
  ::  
  
        # Configuration TaxHub
            WSGIScriptAlias /taxhub "/home/synthese/taxhub/app.wsgi"
            <Directory "/home/synthese/taxhub/">
              Order allow,deny
              Allow from all
              Require all granted
            </Directory>
        #FIN Configuration TaxHub

* Apache inférieur à 2.4 : Avant la dernière ligne ``</VirtualHost>``, copier-coller le texte ci-dessous en adaptant les chemins à votre installation.
 
  ::  
  
        # Configuration TaxHub
            WSGIScriptAlias /taxhub "/home/synthese/taxhub/app.wsgi"
            <Directory "/home/synthese/taxhub/">
                Order allow,deny
                AllowOverride all
                allow from all
            </Directory>
        #FIN Configuration TaxHub

* Redémarrer Apache
 
  ::  
  
        sudo apache2ctl restart


Création de la base de données
==============================

* Lancer le fichier d'installation et de préparation de la base de données
 
  ::  
  
        cd /home/synthese/taxhub
        sudo ./install_db.sh

TODO : création de la connexion avec UsersHub (https://github.com/PnEcrins/UsersHub/)
        
Installation de l'application
=============================

* Lancer le fichier d'installation et de configuration de l'application
 
  ::  
  
        ./install_app.sh

* Tester l'accès à l'application : http://mondomaine.fr/taxhub

Mise à jour de l'application
=============================

Les différentes versions de TaxHub sont disponibles sur le Github du projet (https://github.com/PnX-SI/TaxHub/releases)

* Télécharger et extraire la version souhaitée dans un répertoire séparé (où ``X.Y.Z`` est à remplacer par le numéro de la version que vous installez) :
 
  ::  
  
        cd /home/synthese/
        wget https://github.com/PnX-SI/TaxHub/archive/X.Y.Z.zip
        unzip X.Y.Z.zip
        mv taxhub taxhub_old
        mv TaxHub-X.Y.Z/ taxhub
        rm X.Y.Z.zip
        
* Récupérez l'ancien fichier de configuration de la BDD :
 
  ::  
  
        cp taxhub_old/settings.ini taxhub/settings.ini

Assurez vous que le paramètre ``drop_apps_db`` est bien égal à ``false`` pour ne pas écraser la BDD.

* Lancer l'installation de l'application et de ses dépendances : 
 
  ::  
  
        cd taxhub
        ./install_app.sh
        
* Récupérez les autres fichiers de configuration :
 
  ::  
  
        cp ../taxhub_old/settings.ini settings.ini
        cp ../taxhub_old/static/app/constants.js static/app/constants.js
        
* Récupérez les médias uploadés dans la précédente version : 
 
  ::  
  
        cp -aR ../taxhub_old/static/medias/ static/

* Lire attentivement les notes de chaque version si il y a des spécificités (https://github.com/PnX-SI/TaxHub/releases). Suivre ces instructions avant de continuer la mise à jour.

* Une fois que l'installation est terminée et fonctionnelle, vous pouvez supprimer la version précédente de TaxHub (répertoire ``taxhub_old``).
