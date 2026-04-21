<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Reason;

class Incident extends Model
{
    use HasFactory;

    protected $fillable = [
        'createdBy',
        'downTimeStart',
        'downTimeEnd',
        'duration',
        'remark',
        'status',
        'channel',
        'reasonId',
    ];

    /*
    |----------------------------------
    | Relationships
    |----------------------------------
    */

    // The user who created the incident
    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    // Reason relationship
    public function reason()
    {
        return $this->belongsTo(Reason::class, 'reasonId');
    }

    // Users involved in this incident (many-to-many if you kept pivot)
    public function users()
    {
        return $this->belongsToMany(User::class, 'incident__user')
                    ->withPivot('involvement')
                    ->withTimestamps();
    }
}