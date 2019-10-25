<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSheetFile extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sheetFiles', function (Blueprint $table) {
          $table->uuid('id')->primary();
          $table->uuid('sheetId');
          $table->uuid('cellId');
          $table->string('filename');
          $table->uuid('s3Uuid');
          $table->string('s3Bucket');
          $table->string('s3Key');
          $table->string('uploadedBy');
          $table->datetime('uploadedAt');
          $table->timestamps();

          $table->foreign('sheetId')->references('id')->on('sheets');
          $table->foreign('cellId')->references('id')->on('sheetCells');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sheetFiles');
    }
}
