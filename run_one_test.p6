sub MAIN($test) {
  %*ENV<PARCEL_WORKERS> = 1;
  my $mangled = 'mangled_spec'.IO.add($test.IO.relative($test.IO.parent.parent));
  my $out = 'dist'.IO.add($mangled.IO.dirname.IO.basename ~ '___' ~ $mangled.IO.basename.subst('.t', '.js'));
  say($mangled);
  say($out);

  run('perl6-m', 'mangle_spec', $test);
  unlink($out);
  run('perl6-m', 'parcel_everything.p6', $mangled);
  run('node', 'runTests.js', $out);
}
