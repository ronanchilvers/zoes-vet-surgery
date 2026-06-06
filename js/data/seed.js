(function () {
  "use strict";

  var today = new Date();

  function isoDate(offsetDays, hour, minute) {
    var date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays, hour, minute || 0, 0, 0);
    return date.toISOString();
  }

  var clients = [
    { id: "client-001", name: "Amelia Hart", phone: "07123 010101", email: "amelia.hart@example.test", address: "4 Willow Close" },
    { id: "client-002", name: "Ben Carter", phone: "07123 010102", email: "ben.carter@example.test", address: "12 Oak Street" },
    { id: "client-003", name: "Chloe Singh", phone: "07123 010103", email: "chloe.singh@example.test", address: "8 Meadow Lane" },
    { id: "client-004", name: "Daniel Brooks", phone: "07123 010104", email: "daniel.brooks@example.test", address: "19 Orchard Road" },
    { id: "client-005", name: "Ella Morris", phone: "07123 010105", email: "ella.morris@example.test", address: "3 Poppy Mews" },
    { id: "client-006", name: "Freya Wilson", phone: "07123 010106", email: "freya.wilson@example.test", address: "27 River View" },
    { id: "client-007", name: "George Evans", phone: "07123 010107", email: "george.evans@example.test", address: "6 Maple Avenue" },
    { id: "client-008", name: "Hannah Reed", phone: "07123 010108", email: "hannah.reed@example.test", address: "41 Garden Road" },
    { id: "client-009", name: "Isaac Turner", phone: "07123 010109", email: "isaac.turner@example.test", address: "15 Station Walk" },
    { id: "client-010", name: "Jasmine Patel", phone: "07123 010110", email: "jasmine.patel@example.test", address: "22 Cherry Grove" },
    { id: "client-011", name: "Kai Morgan", phone: "07123 010111", email: "kai.morgan@example.test", address: "9 Hilltop Way" },
    { id: "client-012", name: "Lily Cooper", phone: "07123 010112", email: "lily.cooper@example.test", address: "31 Foxglove Drive" },
    { id: "client-013", name: "Maya Bennett", phone: "07123 010113", email: "maya.bennett@example.test", address: "5 Brookside" },
    { id: "client-014", name: "Noah Hughes", phone: "07123 010114", email: "noah.hughes@example.test", address: "18 School Lane" },
    { id: "client-015", name: "Olivia Price", phone: "07123 010115", email: "olivia.price@example.test", address: "7 Chestnut Court" },
    { id: "client-016", name: "Priya Shah", phone: "07123 010116", email: "priya.shah@example.test", address: "24 Sunflower Street" },
    { id: "client-017", name: "Ruby Adams", phone: "07123 010117", email: "ruby.adams@example.test", address: "11 Kingfisher Rise" },
    { id: "client-018", name: "Sam Walker", phone: "07123 010118", email: "sam.walker@example.test", address: "30 Elm Terrace" },
    { id: "client-019", name: "Theo Clarke", phone: "07123 010119", email: "theo.clarke@example.test", address: "2 Primrose Path" },
    { id: "client-020", name: "Zara Lewis", phone: "07123 010120", email: "zara.lewis@example.test", address: "16 Lavender Row" }
  ];

  var pets = [
    { id: "pet-001", clientId: "client-001", name: "Pip", species: "Dog", description: "Cocker spaniel", age: 4 },
    { id: "pet-002", clientId: "client-001", name: "Miso", species: "Cat", description: "Tabby cat", age: 7 },
    { id: "pet-003", clientId: "client-002", name: "Nibbles", species: "Rabbit", description: "Dwarf lop", age: 2 },
    { id: "pet-004", clientId: "client-003", name: "Sunny", species: "Budgie", description: "Yellow budgie", age: 1 },
    { id: "pet-005", clientId: "client-004", name: "Scout", species: "Dog", description: "Labrador", age: 6 },
    { id: "pet-006", clientId: "client-005", name: "Clover", species: "Guinea pig", description: "Smooth coat guinea pig", age: 3 },
    { id: "pet-007", clientId: "client-005", name: "Pebble", species: "Hamster", description: "Syrian hamster", age: 1 },
    { id: "pet-008", clientId: "client-006", name: "Luna", species: "Cat", description: "Black shorthair", age: 5 },
    { id: "pet-009", clientId: "client-007", name: "Biscuit", species: "Dog", description: "Beagle", age: 8 },
    { id: "pet-010", clientId: "client-008", name: "Fern", species: "Tortoise", description: "Hermann's tortoise", age: 12 },
    { id: "pet-011", clientId: "client-009", name: "Rocket", species: "Dog", description: "Jack Russell terrier", age: 3 },
    { id: "pet-012", clientId: "client-010", name: "Tilly", species: "Cat", description: "Calico cat", age: 4 },
    { id: "pet-013", clientId: "client-010", name: "Pickle", species: "Rabbit", description: "Lionhead rabbit", age: 2 },
    { id: "pet-014", clientId: "client-011", name: "Dash", species: "Dog", description: "Border collie", age: 5 },
    { id: "pet-015", clientId: "client-012", name: "Mango", species: "Parrot", description: "Small parrot", age: 9 },
    { id: "pet-016", clientId: "client-013", name: "Waffles", species: "Cat", description: "Ginger shorthair", age: 6 },
    { id: "pet-017", clientId: "client-014", name: "Sprout", species: "Guinea pig", description: "Abyssinian guinea pig", age: 2 },
    { id: "pet-018", clientId: "client-015", name: "Blue", species: "Fish", description: "Fancy goldfish", age: 1 },
    { id: "pet-019", clientId: "client-016", name: "Hazel", species: "Dog", description: "Miniature poodle", age: 7 },
    { id: "pet-020", clientId: "client-016", name: "Dot", species: "Mouse", description: "Fancy mouse", age: 1 },
    { id: "pet-021", clientId: "client-017", name: "Otis", species: "Cat", description: "Maine coon mix", age: 8 },
    { id: "pet-022", clientId: "client-018", name: "Poppy", species: "Dog", description: "Dachshund", age: 4 },
    { id: "pet-023", clientId: "client-019", name: "Coco", species: "Hamster", description: "Roborovski hamster", age: 1 },
    { id: "pet-024", clientId: "client-020", name: "Mabel", species: "Rabbit", description: "Dutch rabbit", age: 5 },
    { id: "pet-025", clientId: "client-020", name: "Bean", species: "Cat", description: "Tuxedo cat", age: 3 }
  ];

  var medications = [
    { id: "med-001", name: "Pawberry Comfort Drops", category: "Comfort", usageNotes: "Pretend drops for sore paws after a gentle checkup." },
    { id: "med-002", name: "Whisker Wobble Tonic", category: "Balance", usageNotes: "Fictional tonic for pets who feel a bit wobbly after too much running." },
    { id: "med-003", name: "Tummy Tickle Tablets", category: "Digestion", usageNotes: "Toy tablets for mild pretend tummy rumbles." },
    { id: "med-004", name: "Feather Shine Mist", category: "Coat and feather", usageNotes: "Play spray for dull feathers after a bath." },
    { id: "med-005", name: "Bunny Bounce Balm", category: "Movement", usageNotes: "Pretend balm for stiff bunny hops." },
    { id: "med-006", name: "Sleepy Snout Syrup", category: "Rest", usageNotes: "Fictional syrup for helping an anxious toy pet rest." },
    { id: "med-007", name: "Scale Sparkle Solution", category: "Aquatic", usageNotes: "Playful fish-bowl care solution for shiny scales." },
    { id: "med-008", name: "Tiny Tooth Gel", category: "Dental", usageNotes: "Pretend dental gel used after checking tiny teeth." }
  ];

  var treatments = [
    { id: "treat-001", name: "Gentle Paw Wrap", category: "Bandage", usageNotes: "Soft pretend wrap for a sore or muddy paw." },
    { id: "treat-002", name: "Warm Blanket Rest", category: "Recovery", usageNotes: "A calm rest treatment after a busy appointment." },
    { id: "treat-003", name: "Feather Tidy-Up", category: "Grooming", usageNotes: "Careful grooming for birds with ruffled feathers." },
    { id: "treat-004", name: "Rabbit Hop Check", category: "Mobility", usageNotes: "A simple movement check for bunnies and small pets." },
    { id: "treat-005", name: "Tooth Peek Exam", category: "Dental", usageNotes: "A gentle look at teeth for pets who chew toys." },
    { id: "treat-006", name: "Coat Brush Session", category: "Grooming", usageNotes: "Brushing treatment for tangles, fluff, and pretend mud." },
    { id: "treat-007", name: "Quiet Corner Observation", category: "Observation", usageNotes: "Short observation for pets who need a calm moment." },
    { id: "treat-008", name: "Fish Bowl Freshen", category: "Aquatic", usageNotes: "Pretend check of water, bubbles, and fish comfort." }
  ];

  var appointments = [
    { id: "appt-001", petId: "pet-001", clientId: "client-001", startsAt: isoDate(0, 9, 0), reason: "Pip is limping after a garden race.", severity: "medium", status: "booked", notes: [] },
    { id: "appt-002", petId: "pet-004", clientId: "client-003", startsAt: isoDate(0, 10, 30), reason: "Sunny has ruffled feathers and is quiet.", severity: "medium", status: "booked", notes: [] },
    { id: "appt-003", petId: "pet-008", clientId: "client-006", startsAt: isoDate(0, 13, 15), reason: "Luna has been hiding and missing dinner.", severity: "high", status: "booked", notes: [] },
    { id: "appt-004", petId: "pet-010", clientId: "client-008", startsAt: isoDate(1, 9, 45), reason: "Fern needs a shell sparkle check.", severity: "low", status: "booked", notes: [] },
    { id: "appt-005", petId: "pet-011", clientId: "client-009", startsAt: isoDate(1, 11, 0), reason: "Rocket has a scratch on one ear.", severity: "medium", status: "booked", notes: [] },
    { id: "appt-006", petId: "pet-013", clientId: "client-010", startsAt: isoDate(2, 14, 0), reason: "Pickle is not hopping as much today.", severity: "medium", status: "booked", notes: [] },
    { id: "appt-007", petId: "pet-015", clientId: "client-012", startsAt: isoDate(3, 10, 15), reason: "Mango keeps fluffing up after naps.", severity: "low", status: "booked", notes: [] },
    { id: "appt-008", petId: "pet-018", clientId: "client-015", startsAt: isoDate(4, 15, 30), reason: "Blue is swimming slowly near the plants.", severity: "low", status: "booked", notes: [] },
    { id: "appt-009", petId: "pet-019", clientId: "client-016", startsAt: isoDate(5, 9, 30), reason: "Hazel has a tangled coat and sore paw.", severity: "medium", status: "booked", notes: [] },
    { id: "appt-010", petId: "pet-021", clientId: "client-017", startsAt: isoDate(6, 12, 0), reason: "Otis needs a tooth peek after chewing toys.", severity: "low", status: "booked", notes: [] }
  ];

  window.ZoeVetSeed = {
    version: 1,
    create: function () {
      return {
        version: 1,
        generatedAt: new Date().toISOString(),
        clients: clients,
        pets: pets,
        medications: medications,
        treatments: treatments,
        appointments: appointments,
        procedures: []
      };
    }
  };
}());
