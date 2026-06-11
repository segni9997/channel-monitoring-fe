<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Incident;

class Reason extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'channel_id',
        'responsible_dept',
    ];

    public function incidents()
    {
        return $this->hasMany(Incident::class, 'reasonId');
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class, 'channel_id');
    }
}