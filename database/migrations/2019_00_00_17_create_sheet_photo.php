<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSheetPhoto extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sheetPhotos', function (Blueprint $table) {
          $table->uuid('id')->primary();
          $table->uuid('sheetId');
          $table->uuid('cellId');
          $table->string('url');
          $table->string('uploadedBy');
          $table->string('uploadedDate');
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
        Schema::dropIfExists('sheetPhotos');
    }
}
