<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Atm;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function atms()
    {
        return $this->hasMany(Atm::class, 'branch_id');
    }
}
