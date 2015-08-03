import os
import json
import shutil

from os import path
from time import time


class Mover(object):

    def __init__(self, src, dst, options = {}):
        self.src = src
        self.dst = dst
        self.options = options

    def move(self):
        raise NotImplemented('Not Implemented');


    @classmethod
    def createInstance(cls, src, dst, options = {}):
        if dst.find('://') >= 0:
            schema, path = dst.split('://', 1)
        else:
            schema, path = ('file', dst)

        if schema == '':
            schema = 'file'

        if schema == 'file':
            mover = FileMover(src, path, options)
        elif schema == 'scp':
            mover = ScpMover(src, path, options)
        else:
            raise NotImplemented('The path schema: %s is not supportted' % schema)

        return mover
        

class FileMover(Mover):

    def move(self):
        dst = self.dst
        src = self.src

        if path.exists(dst):
            shutil.move(dst, dst + '.old')

        try:
            print "Moving %s to %s" % (src, dst)
            parent_dir = path.dirname(dst)
            if not path.exists(parent_dir):
                os.makedirs(parent_dir)
            shutil.move(src, dst)
            print 'Moved success'
        except:
            shutil.move(dst + '.old', dst)

        if path.exists(dst + '.old'):
            shutil.rmtree(dst + '.old')


class ScpMover(Mover):

    def exec_remote(self, remote, command):
        return os.system("ssh -o BatchMode=yes -o StrictHostKeyChecking=no %s %s '%s'" % (self.build_ssh_extra_params(), remote, command))

    def build_ssh_extra_params(self):
        extraParams = ''
        if 'keyFile' in self.options:
            extraParams = '-i ' + self.options['keyFile']

        return extraParams;

    def move(self):
        src = self.src
        host, path = self.dst.split(':', 1)
        tmp = self.dst + '.' + str(time())

        cmd = 'scp -o BatchMode=yes -o StrictHostKeyChecking=no  -r  %s %s %s' % (self.build_ssh_extra_params(), src, tmp)
        print 'Start copy files'
        os.system(cmd)

        print 'Deploy copied files'
        
        tmpPath = tmp.split(':', 1)[1]

        command = '''
            if [ -r %s ] ; then
                mv %s %s.old ;
            fi

            mv %s %s ;

            if [ -r %s.old ] ; then
                rm -rf %s.old;
            fi
        ''' % (path, path, path, tmpPath, path, path, path)

        self.exec_remote(host, command);

        print 'Deploy success'
