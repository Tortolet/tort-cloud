package com.example.tortcloud.controllers;

import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ZipTest {


    @Test
    public void testZip() throws IOException {
        // Specify the source directory and the output zip file name
        File sourceDir = new File("D:\\Java\\TortCloud\\upload");
        File outputFile = new File("C:\\Users\\ivanm\\Desktop\\file.zip");

        // Create a ZipOutputStream to write to the output file
        FileOutputStream fos = new FileOutputStream(outputFile);
        ZipOutputStream zipOut = new ZipOutputStream(fos);

        // Iterate over all files and directories in the source directory
        for (File file : FileUtils.listFiles(sourceDir, null, true)) {

            // Create a new ZipEntry for the current file
            ZipEntry zipEntry = new ZipEntry(sourceDir.toPath().relativize(file.toPath()).toString());
            zipOut.putNextEntry(zipEntry);

            // Copy the contents of the file to the zip stream
            if (!file.isDirectory()) {
                FileInputStream fis = new FileInputStream(file);
                byte[] buffer = new byte[1024];
                int length;
                while ((length = fis.read(buffer)) > 0) {
                    zipOut.write(buffer, 0, length);
                }
                fis.close();
            }

            // Close the current zip entry
            zipOut.closeEntry();
        }

        // Close the ZipOutputStream
        zipOut.close();
        fos.close();
    }
}
