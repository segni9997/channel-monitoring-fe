<?php

namespace Database\Factories;

use App\Models\Incident;
use App\Models\User;
use App\Models\Reason;
use App\Models\Branch;
use App\Models\Atm;
use Illuminate\Database\Eloquent\Factories\Factory;

class IncidentFactory extends Factory
{
    protected $model = Incident::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-1 month', 'now');
        $end = $this->faker->optional(0.7)->dateTimeBetween($start, 'now');
        
        $duration = null;
        if ($end) {
            $diff = $start->diff($end);
            $duration = $diff->format('%H:%I:%S');
        }

        return [
            'createdBy' => User::factory(),
            'downTimeStart' => $start,
            'downTimeEnd' => $end,
            'duration' => $duration,
            'remark' => $this->faker->sentence,
            'status' => $end ? 'completed' : 'inprogress',
            'channel' => $this->faker->randomElement(['USSD', 'APP', 'ATM', 'IPS', 'TOPUP', 'IBANK', 'LOROIB']),
            'reasonId' => Reason::factory(),
            'branch_id' => Branch::factory(),
            'atm_id' => Atm::factory(),
        ];
    }
}
